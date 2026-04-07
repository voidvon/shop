import type {
  BindMemberCardCommand,
  LookupMemberCardResult,
  MemberAssetsService,
} from '../domain/member-assets-service'
import {
  normalizeMemberCardNumber,
  normalizeMemberCardSecret,
  validateMemberCardNumber,
  validateMemberCardSecret,
} from '../domain/member-card-bind-rules'
import type { MemberAssetsRepository } from './member-assets-repository'

function resolveCardNumberSeed(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '')

  if (digits) {
    return Number.parseInt(digits.slice(-2), 10) || 0
  }

  return Array.from(cardNumber).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 100
}

function resolveRechargeAmount(cardNumber: string) {
  const normalized = normalizeMemberCardNumber(cardNumber)
  const suffix = resolveCardNumberSeed(normalized)
  return 50 + suffix
}

function resolveRedeemCode(cardNumber: string) {
  const normalized = normalizeMemberCardNumber(cardNumber)
  const suffix = normalized.slice(-8).padStart(8, '0')
  return `EX-${suffix}`
}

function resolveCardTitle(cardNumber: string) {
  const normalized = normalizeMemberCardNumber(cardNumber)
  const suffix = normalized.slice(-4).padStart(4, '0')
  return `文惠储值卡 ${suffix}`
}

export function createBrowserMemberAssetsService(
  repository: MemberAssetsRepository,
): MemberAssetsService {
  return {
    async lookupMemberCard(command: BindMemberCardCommand): Promise<LookupMemberCardResult> {
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

      const amount = resolveRechargeAmount(cardNumber)
      const redemptionRecords = await repository.readRedemptionRecords()
      const hasBoundRecord = redemptionRecords.some((record) => record.cardNumber === cardNumber)

      return {
        balanceTypeName: '文惠储值卡',
        canBind: !hasBoundRecord,
        cardNumber,
        currentAmount: amount,
        faceValue: amount,
        statusText: hasBoundRecord ? '已绑定' : '未绑定',
      }
    },

    async bindMemberCard(command: BindMemberCardCommand) {
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

      const amount = resolveRechargeAmount(cardNumber)
      const cardTitle = resolveCardTitle(cardNumber)
      const redeemedCode = resolveRedeemCode(cardNumber)

      await repository.redeemMemberCard({
        amount,
        cardNumber,
        cardTitle,
        redeemedCode,
      })
      const balanceAmount = await repository.creditBalance({
        amount,
        description: `${cardTitle} 充值到账`,
      })

      return {
        balanceAmount,
      }
    },

    async getSnapshot() {
      const [balanceRecord, bindPage, redemptionRecords] = await Promise.all([
        repository.readBalance(),
        repository.getBindPageData(),
        repository.readRedemptionRecords(),
      ])

      return {
        balanceAccounts: [
          {
            accountId: 'mock-balance-account',
            availableAmount: balanceRecord.balanceAmount,
            balanceTypeCode: 'mock',
            balanceTypeId: 1,
            balanceTypeName: '文惠储值卡',
            frozenAmount: 0,
          },
        ],
        balanceAmount: balanceRecord.balanceAmount,
        balanceLogs: balanceRecord.balanceLogs,
        bindPage,
        redemptionRecords,
      }
    },

    async spendBalance(command) {
      return repository.spendBalance(command)
    },
  }
}
