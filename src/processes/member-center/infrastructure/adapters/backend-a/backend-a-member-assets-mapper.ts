import type {
  BindMemberCardResult,
  MemberAssetsSnapshot,
} from '../../../domain/member-assets-service'
import { sortBalanceAccountsForDisplay } from '@/shared/lib/balance-accounts'
import type {
  BackendABindMemberCardResponseDto,
  BackendAMemberAssetsSnapshotDto,
  BackendASpendBalanceResponseDto,
} from './backend-a-member-assets-gateway'

export function mapBackendAMemberAssetsSnapshot(dto: BackendAMemberAssetsSnapshotDto): MemberAssetsSnapshot {
  const balanceAccounts = sortBalanceAccountsForDisplay([
    {
      accountId: 'backend-a-gateway-balance',
      availableAmount: dto.balance.amount,
      balanceTypeCode: 'default',
      balanceTypeId: 0,
      balanceTypeName: '账户余额',
      frozenAmount: 0,
    },
  ])

  return {
    balanceAccounts,
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
  }
}

export function mapBackendASpendBalanceResult(dto: BackendASpendBalanceResponseDto) {
  return dto.currentBalanceAmount
}
