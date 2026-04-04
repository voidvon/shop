import type { MemberAuthSession } from '@/entities/member-auth'
import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import type { AccountBalanceLog } from '@/shared/types/modules'

import type {
  MemberAssetsService,
  MemberAssetsSnapshot,
  LookupMemberCardResult,
  SpendMemberBalanceCommand,
} from '../../../domain/member-assets-service'
import type { MemberCardRedemptionRecord } from '../../../domain/member-center-page-data'
import {
  normalizeMemberCardNumber,
  normalizeMemberCardSecret,
  validateMemberCardNumber,
  validateMemberCardSecret,
} from '../../../domain/member-card-bind-rules'
import {
  resolveBackendAMemberCardBindSeed,
} from './backend-a-member-assets-seeds'
import { createBackendAMemberAssetsGatewayFromEnv } from './backend-a-member-assets-http-gateway'
import type { BackendABindMemberCardRequestDto } from './backend-a-member-assets-gateway'
import {
  mapBackendABindMemberCardResult,
  mapBackendAMemberAssetsSnapshot,
} from './backend-a-member-assets-mapper'

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

interface BackendAStoredValueCardSummaryDto {
  card_no?: string | null
  id?: number | string | null
}

interface BackendARechargeRecordDto {
  amount?: number | string | null
  balance_type?: BackendABalanceTypeDto | null
  id?: number | string | null
  recharged_at?: string | null
  request_no?: string | null
  status?: number | null
  stored_value_card?: BackendAStoredValueCardSummaryDto | null
}

interface BackendAStoredValueCardLookupDto {
  balance_type?: BackendABalanceTypeDto | null
  can_bind?: boolean | null
  card_no?: string | null
  current_amount?: number | string | null
  face_value?: number | string | null
  status?: number | null
  status_text?: string | null
}

function parseAmount(value: number | string | null | undefined) {
  const parsedValue = typeof value === 'number' ? value : Number.parseFloat(value ?? '')
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function createBindRequestNo() {
  return `bind_${Date.now()}`
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

function normalizeRechargeRecordOccurredAt(value: string | null | undefined) {
  const occurredAt = value?.trim()

  if (!occurredAt) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  return occurredAt.replace('T', ' ').replace(/\+\d{2}:\d{2}$/, '')
}

function normalizeRechargeRecords(input: unknown): MemberCardRedemptionRecord[] {
  const rawList = Array.isArray(input)
    ? input
    : input && typeof input === 'object'
      ? (
          input && typeof input === 'object' && Array.isArray((input as { data?: unknown[] }).data)
            ? (input as { data: unknown[] }).data
            : input && typeof input === 'object'
              && (input as { data?: { data?: unknown[] } }).data
              && Array.isArray((input as { data: { data: unknown[] } }).data.data)
              ? (input as { data: { data: unknown[] } }).data.data
              : []
        )
      : []

  return rawList
    .filter((item): item is BackendARechargeRecordDto => Boolean(item) && typeof item === 'object')
    .filter((item) => item.status === undefined || item.status === null || item.status === 1)
    .map((item, index) => {
      const cardNumber = item.stored_value_card?.card_no?.trim() || '-'
      const recordId = String(item.id ?? item.request_no ?? `backend-a-recharge-log-${index + 1}`)
      const requestNo = item.request_no?.trim() || recordId
      const balanceTypeName = item.balance_type?.name?.trim()

      return {
        amount: Math.abs(parseAmount(item.amount)),
        cardNumber,
        cardTitle: balanceTypeName || '储值卡充值',
        id: recordId,
        occurredAt: normalizeRechargeRecordOccurredAt(item.recharged_at),
        redeemedCode: requestNo,
      }
    })
}

function normalizeLookupErrorMessage(record: BackendAStoredValueCardLookupDto) {
  const statusText = record.status_text?.trim()

  if (statusText) {
    return `当前卡券状态为${statusText}，无法绑定充值`
  }

  return '当前卡券不可绑定充值'
}

function normalizeLookupResult(record: BackendAStoredValueCardLookupDto): LookupMemberCardResult {
  const cardNumber = record.card_no?.trim()

  return {
    balanceTypeName: record.balance_type?.name?.trim() || null,
    canBind: record.can_bind !== false,
    cardNumber: cardNumber || '',
    currentAmount: Math.max(parseAmount(record.current_amount), 0),
    faceValue: Math.max(parseAmount(record.face_value), 0),
    statusText: record.status_text?.trim() || (record.can_bind === false ? '不可绑定' : '未绑定'),
  }
}

function mapRemoteSnapshotToMemberAssetsSnapshot(input: {
  accounts: BackendABalanceAccountDto[]
  logs: AccountBalanceLog[]
  redemptionRecords: MemberCardRedemptionRecord[]
}): MemberAssetsSnapshot {
  return {
    balanceAmount: resolvePrimaryBalanceAmount(input.accounts),
    balanceLogs: input.logs,
    bindPage: resolveBackendAMemberCardBindSeed(),
    redemptionRecords: input.redemptionRecords,
  }
}

export function createBackendAMemberAssetsService(memberAuthSession: MemberAuthSession): MemberAssetsService {
  const gateway = createBackendAMemberAssetsGatewayFromEnv(memberAuthSession)
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

  async function fetchRechargeLogs() {
    const response = await httpClient.get<unknown>('/api/v1/stored-value-cards/recharge-logs', {
      per_page: 20,
    })

    return normalizeRechargeRecords(response)
  }

  async function lookupStoredValueCard(cardNumber: string, cardSecret: string) {
    return httpClient.post<BackendAStoredValueCardLookupDto>('/api/v1/stored-value-cards/lookup', {
      card_no: cardNumber,
      card_secret: cardSecret,
    })
  }

  async function readSwaggerSnapshot() {
    const [accounts, logs, redemptionRecords] = await Promise.all([
      fetchBalanceAccounts(),
      fetchBalanceLogs(),
      fetchRechargeLogs(),
    ])

    return mapRemoteSnapshotToMemberAssetsSnapshot({
      accounts,
      logs,
      redemptionRecords,
    })
  }

  async function readCurrentBalanceAmount() {
    const accounts = await fetchBalanceAccounts()
    return resolvePrimaryBalanceAmount(accounts)
  }

  return {
    async lookupMemberCard(command): Promise<LookupMemberCardResult> {
      const cardNumber = normalizeMemberCardNumber(command.cardNumber)
      const cardSecret = normalizeMemberCardSecret(command.cardSecret)
      const cardNumberError = validateMemberCardNumber(cardNumber)
      const cardSecretError = validateMemberCardSecret(cardSecret)

      if (cardNumberError) {
        throw new Error(cardNumberError)
      }

      if (cardSecretError) {
        throw new Error(cardSecretError)
      }

      return normalizeLookupResult(await lookupStoredValueCard(cardNumber, cardSecret))
    },

    async bindMemberCard(command) {
      const cardNumber = normalizeMemberCardNumber(command.cardNumber)
      const cardSecret = normalizeMemberCardSecret(command.cardSecret)
      const cardNumberError = validateMemberCardNumber(cardNumber)
      const cardSecretError = validateMemberCardSecret(cardSecret)

      if (cardNumberError) {
        throw new Error(cardNumberError)
      }

      if (cardSecretError) {
        throw new Error(cardSecretError)
      }

      const lookupRecord = await lookupStoredValueCard(cardNumber, cardSecret)

      if (lookupRecord.can_bind === false) {
        throw new Error(normalizeLookupErrorMessage(lookupRecord))
      }

      if (gateway) {
        const gatewayCommand: BackendABindMemberCardRequestDto = {
          cardNo: cardNumber,
          cardSecret,
        }

        return mapBackendABindMemberCardResult(await gateway.bindMemberCard(gatewayCommand))
      }

      await httpClient.post<unknown>('/api/v1/stored-value-cards/recharge', {
        card_no: cardNumber,
        card_secret: cardSecret,
        request_no: createBindRequestNo(),
      })
      const balanceAmount = await readCurrentBalanceAmount()

      return {
        balanceAmount,
      }
    },

    async getSnapshot() {
      if (gateway) {
        return mapBackendAMemberAssetsSnapshot(await gateway.getSnapshot())
      }

      return readSwaggerSnapshot()
    },

    async spendBalance(_command: SpendMemberBalanceCommand) {
      return readCurrentBalanceAmount()
    },
  }
}
