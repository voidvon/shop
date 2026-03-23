import type { MemberAuthSession } from '@/entities/member-auth'
import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import type { AccountBalanceLog } from '@/shared/types/modules'

import type {
  BindMemberCardResult,
  MemberAssetsService,
  MemberAssetsSnapshot,
  SpendMemberBalanceCommand,
} from '../../../domain/member-assets-service'
import { createBrowserMemberAssetsRepository } from '../../create-browser-member-assets-repository'
import {
  backendAMemberAssetsNamespace,
  resolveBackendAMemberBalanceLogSeed,
  resolveBackendAMemberBalanceSeed,
  resolveBackendAMemberCardBindSeed,
  resolveBackendAMemberCardRedemptionSeed,
} from './backend-a-member-assets-seeds'

interface BackendABalanceTypeDto {
  code: string
  id: number
  name: string
}

interface BackendABalanceAccountDto {
  available_amount: string
  balance_type?: BackendABalanceTypeDto
  balance_type_id: number
  frozen_amount: string
  id: number
  user_id: number
}

interface BackendABalanceLogDto {
  amount?: number | string | null
  business_type?: string | null
  created_at?: string | null
  description?: string | null
  direction?: string | null
  id?: number | string | null
  remark?: string | null
  title?: string | null
  type?: string | null
}

function parseAmount(value: number | string | null | undefined) {
  const parsedValue = typeof value === 'number' ? value : Number.parseFloat(value ?? '')
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 16)
}

function createBindRequestNo() {
  return `bind_${Date.now()}`
}

function resolveCardTitle(cardNumber: string) {
  const suffix = cardNumber.slice(-4).padStart(4, '0')
  return `Backend A 储值卡 ${suffix}`
}

function resolveRedeemCode() {
  return `SV-${Date.now()}`
}

function resolvePrimaryBalanceAmount(accounts: BackendABalanceAccountDto[]) {
  return accounts.reduce((maxAmount, account) => {
    const amount = parseAmount(account.available_amount)
    return amount > maxAmount ? amount : maxAmount
  }, 0)
}

function normalizeBalanceLogDirection(value: string | null | undefined): AccountBalanceLog['direction'] {
  const normalizedValue = value?.trim().toLowerCase() ?? ''

  if (
    normalizedValue.includes('expense')
    || normalizedValue.includes('debit')
    || normalizedValue.includes('pay')
    || normalizedValue.includes('consume')
    || normalizedValue.includes('out')
    || normalizedValue.includes('minus')
  ) {
    return 'expense'
  }

  return 'income'
}

function normalizeBalanceLogDescription(log: BackendABalanceLogDto) {
  return log.description?.trim()
    || log.remark?.trim()
    || log.title?.trim()
    || log.business_type?.trim()
    || '余额变动'
}

function normalizeBalanceLogOccurredAt(log: BackendABalanceLogDto) {
  const occurredAt = log.created_at?.trim()

  if (!occurredAt) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  return occurredAt.replace('T', ' ').replace(/\+\d{2}:\d{2}$/, '')
}

function normalizeBalanceLogs(input: unknown): AccountBalanceLog[] {
  const rawList = Array.isArray(input)
    ? input
    : input && typeof input === 'object'
      ? (
          Array.isArray((input as { data?: unknown }).data)
            ? (input as { data: unknown[] }).data
            : Array.isArray((input as { list?: unknown }).list)
              ? (input as { list: unknown[] }).list
              : []
        )
      : []

  return rawList
    .filter((item): item is BackendABalanceLogDto => Boolean(item) && typeof item === 'object')
    .map((item, index) => {
      const direction = normalizeBalanceLogDirection(item.direction ?? item.type)
      const amount = Math.abs(parseAmount(item.amount))

      return {
        amount,
        description: normalizeBalanceLogDescription(item),
        direction,
        id: String(item.id ?? `backend-a-balance-log-${index + 1}`),
        occurredAt: normalizeBalanceLogOccurredAt(item),
      }
    })
}

function mapRemoteSnapshotToMemberAssetsSnapshot(input: {
  accounts: BackendABalanceAccountDto[]
  bindPage: Awaited<ReturnType<ReturnType<typeof createBrowserMemberAssetsRepository>['getBindPageData']>>
  logs: AccountBalanceLog[]
  redemptionRecords: Awaited<ReturnType<ReturnType<typeof createBrowserMemberAssetsRepository>['readRedemptionRecords']>>
}): MemberAssetsSnapshot {
  return {
    balanceAmount: resolvePrimaryBalanceAmount(input.accounts),
    balanceLogs: input.logs,
    bindPage: input.bindPage,
    redemptionRecords: input.redemptionRecords,
  }
}

export function createBackendAMemberAssetsService(memberAuthSession: MemberAuthSession): MemberAssetsService {
  const repository = createBrowserMemberAssetsRepository({
    getBindPageData: resolveBackendAMemberCardBindSeed,
    getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
    getSeedBalance: resolveBackendAMemberBalanceSeed,
    getSeedBalanceLogs: resolveBackendAMemberBalanceLogSeed,
    getSeedRedemptionRecords: resolveBackendAMemberCardRedemptionSeed,
    namespace: backendAMemberAssetsNamespace,
  })
  const httpClient = createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })

  async function fetchBalanceAccounts() {
    return httpClient.get<BackendABalanceAccountDto[]>('/api/v1/balance-accounts')
  }

  async function fetchBalanceLogs() {
    const response = await httpClient.get<unknown>('/api/v1/balance-accounts/logs', {
      per_page: 20,
    })

    return normalizeBalanceLogs(response)
  }

  async function readRemoteSnapshot() {
    const [accounts, logs, bindPage, redemptionRecords] = await Promise.all([
      fetchBalanceAccounts(),
      fetchBalanceLogs(),
      repository.getBindPageData(),
      repository.readRedemptionRecords(),
    ])

    return mapRemoteSnapshotToMemberAssetsSnapshot({
      accounts,
      bindPage,
      logs,
      redemptionRecords,
    })
  }

  async function readCurrentBalanceAmount() {
    const accounts = await fetchBalanceAccounts()
    return resolvePrimaryBalanceAmount(accounts)
  }

  return {
    async bindMemberCard(command): Promise<BindMemberCardResult> {
      const cardNumber = normalizeDigits(command.cardNumber)
      const cardSecret = command.cardSecret.trim()

      if (cardNumber.length !== 16) {
        throw new Error('请输入16位卡券编号')
      }

      if (!cardSecret) {
        throw new Error('请输入卡券卡密')
      }

      const previousBalance = await readCurrentBalanceAmount()

      await httpClient.post<unknown>('/api/v1/stored-value-cards/recharge', {
        card_no: cardNumber,
        card_secret: cardSecret,
        request_no: createBindRequestNo(),
      })

      const snapshot = await readRemoteSnapshot()
      const creditedAmount = Math.max(snapshot.balanceAmount - previousBalance, 0)
      const redemption = await repository.redeemMemberCard({
        amount: creditedAmount,
        cardNumber,
        cardTitle: resolveCardTitle(cardNumber),
        redeemedCode: resolveRedeemCode(),
      })

      return {
        balanceAmount: snapshot.balanceAmount,
        redemption,
      }
    },

    async getSnapshot() {
      return readRemoteSnapshot()
    },

    async spendBalance(_command: SpendMemberBalanceCommand) {
      return readCurrentBalanceAmount()
    },
  }
}
