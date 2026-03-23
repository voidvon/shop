import type {
  BindMemberCardCommand,
  MemberAssetsService,
} from '../domain/member-assets-service'
import type { MemberAssetsRepository } from './member-assets-repository'

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 16)
}

function resolveRechargeAmount(cardNumber: string) {
  const normalized = normalizeDigits(cardNumber)
  const suffix = Number.parseInt(normalized.slice(-2) || '0', 10)
  return 50 + suffix
}

function resolveRedeemCode(cardNumber: string) {
  const normalized = normalizeDigits(cardNumber)
  const suffix = normalized.slice(-8).padStart(8, '0')
  return `EX-${suffix}`
}

function resolveCardTitle(cardNumber: string) {
  const normalized = normalizeDigits(cardNumber)
  const suffix = normalized.slice(-4).padStart(4, '0')
  return `文惠储值卡 ${suffix}`
}

export function createBrowserMemberAssetsService(
  repository: MemberAssetsRepository,
): MemberAssetsService {
  return {
    async bindMemberCard(command: BindMemberCardCommand) {
      const cardNumber = normalizeDigits(command.cardNumber)
      const cardSecret = command.cardSecret.trim()

      if (cardNumber.length !== 16) {
        throw new Error('请输入16位卡券编号')
      }

      if (!cardSecret) {
        throw new Error('请输入卡券卡密')
      }

      const amount = resolveRechargeAmount(cardNumber)
      const cardTitle = resolveCardTitle(cardNumber)
      const redeemedCode = resolveRedeemCode(cardNumber)

      const redemption = await repository.redeemMemberCard({
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
        redemption,
      }
    },

    async getSnapshot() {
      const [balanceRecord, bindPage, redemptionRecords] = await Promise.all([
        repository.readBalance(),
        repository.getBindPageData(),
        repository.readRedemptionRecords(),
      ])

      return {
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
