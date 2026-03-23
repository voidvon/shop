import type {
  BindMemberCardResult,
  MemberAssetsSnapshot,
} from '../../../domain/member-assets-service'
import type {
  BackendABindMemberCardResponseDto,
  BackendAMemberAssetsSnapshotDto,
  BackendASpendBalanceResponseDto,
} from './backend-a-member-assets-gateway'

export function mapBackendAMemberAssetsSnapshot(dto: BackendAMemberAssetsSnapshotDto): MemberAssetsSnapshot {
  return {
    balanceAmount: dto.balance.amount,
    balanceLogs: dto.balance.logs,
    bindPage: {
      canScanCode: dto.cardBinding.canScanQrCode,
      cardNumber: dto.cardBinding.draftCardNo,
    },
    redemptionRecords: dto.redemptions.map((item) => ({
      amount: item.creditedAmount,
      cardNumber: item.cardNo,
      cardTitle: item.cardTitle,
      id: item.recordId,
      occurredAt: item.exchangedAt,
      redeemedCode: item.exchangedCode,
    })),
  }
}

export function mapBackendABindMemberCardResult(dto: BackendABindMemberCardResponseDto): BindMemberCardResult {
  return {
    balanceAmount: dto.currentBalanceAmount,
    redemption: {
      amount: dto.redemption.creditedAmount,
      cardNumber: dto.redemption.cardNo,
      cardTitle: dto.redemption.cardTitle,
      id: dto.redemption.recordId,
      occurredAt: dto.redemption.exchangedAt,
      redeemedCode: dto.redemption.exchangedCode,
    },
  }
}

export function mapBackendASpendBalanceResult(dto: BackendASpendBalanceResponseDto) {
  return dto.currentBalanceAmount
}
