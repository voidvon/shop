import type { AccountBalanceLog } from '@/shared/types/modules'
import type {
  MemberCardBindPageData,
  MemberCardRedemptionRecord,
} from '../../../domain/member-center-page-data'

export const backendAMemberAssetsNamespace = 'backend-a'

export function resolveBackendAMemberBalanceSeed() {
  return 268
}

export function resolveBackendAMemberBalanceLogSeed(): AccountBalanceLog[] {
  return [
    {
      amount: 128,
      description: 'Backend A 储值卡充值',
      direction: 'income',
      id: 'backend-a-balance-log-1',
      occurredAt: '2026-03-08 10:20:00',
    },
    {
      amount: 60,
      description: '商城订单余额支付',
      direction: 'expense',
      id: 'backend-a-balance-log-2',
      occurredAt: '2026-03-12 14:36:00',
    },
  ]
}

export function resolveBackendAMemberCardRedemptionSeed(): MemberCardRedemptionRecord[] {
  return [
    {
      amount: 128,
      cardNumber: '9922000011113344',
      cardTitle: 'Backend A 联名储值卡',
      id: 'backend-a-redemption-1',
      occurredAt: '2026-03-08 10:20:00',
      redeemedCode: 'BA-20260308-3344',
    },
  ]
}

export function resolveBackendAMemberCardBindSeed(): MemberCardBindPageData {
  return {
    canScanCode: true,
    cardNumber: null,
  }
}
