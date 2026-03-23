import { mockAccountData } from '@/shared/mocks'
import type { AccountBalanceLog } from '@/shared/types/modules'
import type { MemberCardBindPageData, MemberCardRedemptionRecord } from '../domain/member-center-page-data'

export const memberAssetsMockNamespace = 'mock'

export function resolveMemberBalanceSeed() {
  return mockAccountData.memberAssetsPageData.balanceAmount
}

export function resolveMemberBalanceLogSeed(): AccountBalanceLog[] {
  return mockAccountData.memberAssetsPageData.balanceLogs
}

export function resolveMemberCardRedemptionSeed(): MemberCardRedemptionRecord[] {
  return [
    {
      amount: 200,
      cardNumber: '6688990011223344',
      cardTitle: '文惠消费卡',
      id: 'mock-redemption-1',
      occurredAt: '2026-03-01 09:20:00',
      redeemedCode: 'WH-20260301-3344',
    },
    {
      amount: 88,
      cardNumber: '6688990055667788',
      cardTitle: '节庆礼遇卡',
      id: 'mock-redemption-2',
      occurredAt: '2026-02-18 12:00:00',
      redeemedCode: 'WH-20260218-7788',
    },
  ]
}

export function resolveMemberCardBindSeed(): MemberCardBindPageData {
  return {
    canScanCode: true,
    cardNumber: mockAccountData.cardBindingPageData.cardNumber,
  }
}
