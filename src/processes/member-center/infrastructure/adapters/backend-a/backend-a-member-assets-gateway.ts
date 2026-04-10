import type {
  BindMemberCardCommand,
  SpendMemberBalanceCommand,
} from '../../../domain/member-assets-service'
import {
  normalizeMemberCardNumber,
  normalizeMemberCardSecret,
} from '../../../domain/member-card-bind-rules'
import type { AccountBalanceLog } from '@/shared/types/modules'
import type { MemberAssetsRepository } from '../../member-assets-repository'

export interface BackendAMemberCardBindPageDto {
  canScanQrCode: boolean
  draftCardNo: string | null
}

export interface BackendAMemberRedemptionDto {
  cardNo: string
  cardTitle: string
  creditedAmount: number
  exchangedCode: string
  exchangedAt: string
  recordId: string
}

export interface BackendAMemberBalanceLogDto extends AccountBalanceLog {}

export interface BackendAMemberAssetsSnapshotDto {
  balance: {
    amount: number
    logs: BackendAMemberBalanceLogDto[]
  }
  cardBinding: BackendAMemberCardBindPageDto
  redemptions: BackendAMemberRedemptionDto[]
}

export interface BackendABindMemberCardRequestDto {
  cardNo: string
  cardSecret: string
  mobile: string
}

export interface BackendABindMemberCardResponseDto {
  currentBalanceAmount: number
  redemption: BackendAMemberRedemptionDto
}

export interface BackendASpendBalanceRequestDto {
  debitAmount: number
  remark: string | null
}

export interface BackendASpendBalanceResponseDto {
  currentBalanceAmount: number
}

export interface BackendAMemberAssetsGateway {
  bindMemberCard(dto: BackendABindMemberCardRequestDto): Promise<BackendABindMemberCardResponseDto>
  getSnapshot(): Promise<BackendAMemberAssetsSnapshotDto>
  spendBalance(dto: BackendASpendBalanceRequestDto): Promise<BackendASpendBalanceResponseDto>
}

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
  return 80 + suffix
}

function resolveRedeemCode(cardNumber: string) {
  const normalized = normalizeMemberCardNumber(cardNumber)
  const suffix = normalized.slice(-8).padStart(8, '0')
  return `BA-${suffix}`
}

function resolveCardTitle(cardNumber: string) {
  const normalized = normalizeMemberCardNumber(cardNumber)
  const suffix = normalized.slice(-4).padStart(4, '0')
  return `Backend A 储值卡 ${suffix}`
}

function mapBindMemberCardCommand(command: BindMemberCardCommand): BackendABindMemberCardRequestDto {
  return {
    cardNo: normalizeMemberCardNumber(command.cardNumber),
    cardSecret: normalizeMemberCardSecret(command.cardSecret),
    mobile: String(command.mobile ?? '').trim(),
  }
}

function mapSpendMemberBalanceCommand(command: SpendMemberBalanceCommand): BackendASpendBalanceRequestDto {
  return {
    debitAmount: command.amount,
    remark: command.description ?? null,
  }
}

function mapRedemptionToDto(record: Awaited<ReturnType<MemberAssetsRepository['redeemMemberCard']>>): BackendAMemberRedemptionDto {
  return {
    cardNo: record.cardNumber,
    cardTitle: record.cardTitle,
    creditedAmount: record.amount,
    exchangedAt: record.occurredAt,
    exchangedCode: record.redeemedCode,
    recordId: record.id,
  }
}

export function createStubBackendAMemberAssetsGateway(
  repository: MemberAssetsRepository,
): BackendAMemberAssetsGateway {
  return {
    async bindMemberCard(dto) {
      const amount = resolveRechargeAmount(dto.cardNo)
      const cardTitle = resolveCardTitle(dto.cardNo)
      const redeemedCode = resolveRedeemCode(dto.cardNo)

      const redemption = await repository.redeemMemberCard({
        amount,
        cardNumber: dto.cardNo,
        cardTitle,
        redeemedCode,
      })
      const currentBalanceAmount = await repository.creditBalance({
        amount,
        description: `${cardTitle} 充值到账`,
      })

      return {
        currentBalanceAmount,
        redemption: mapRedemptionToDto(redemption),
      }
    },

    async getSnapshot() {
      const [bindPageData, balance, redemptions] = await Promise.all([
        repository.getBindPageData(),
        repository.readBalance(),
        repository.readRedemptionRecords(),
      ])

      return {
        balance: {
          amount: balance.balanceAmount,
          logs: balance.balanceLogs,
        },
        cardBinding: {
          canScanQrCode: bindPageData.canScanCode,
          draftCardNo: bindPageData.cardNumber,
        },
        redemptions: redemptions.map(mapRedemptionToDto),
      }
    },

    async spendBalance(dto) {
      const currentBalanceAmount = await repository.spendBalance({
        amount: dto.debitAmount,
        description: dto.remark ?? undefined,
      })

      return {
        currentBalanceAmount,
      }
    },
  }
}

export {
  mapBindMemberCardCommand,
  mapSpendMemberBalanceCommand,
}
