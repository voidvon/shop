import type { MemberAuthSession } from '@/entities/member-auth'
import { getMockOrderSeedRecords } from '@/entities/order/infrastructure/adapters/mock/mock-order-repository'
import { readBrowserOrderRecords } from '@/entities/order/infrastructure/browser-order-storage'

import type { MemberCenterQuery } from '../../../domain/member-center-query'
import { createBrowserMemberOrderSummaryReader } from '../../create-browser-member-order-summary-reader'
import {
  mapMockMemberCardBindPageData,
  mapMockMemberCardsPageData,
  mapMockMemberCenterPageData,
  mapMockMemberFavoritesPageData,
  mapMockMemberHistoryPageData,
} from '../../mappers/mock-member-center-mapper'

export function createMockMemberCenterQuery(memberAuthSession: MemberAuthSession): MemberCenterQuery {
  const getMemberOrderSummary = createBrowserMemberOrderSummaryReader({
    readOrders: () => readBrowserOrderRecords(
      'mock',
      memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
      getMockOrderSeedRecords,
    ),
  })

  return {
    async getMemberCardBindPageData() {
      return Promise.resolve(mapMockMemberCardBindPageData())
    },

    async getMemberCardsPageData() {
      return Promise.resolve(mapMockMemberCardsPageData())
    },

    async getMemberCenterPageData() {
      return Promise.resolve(mapMockMemberCenterPageData(getMemberOrderSummary()))
    },

    async getMemberFavoritesPageData() {
      return Promise.resolve(mapMockMemberFavoritesPageData())
    },

    async getMemberHistoryPageData() {
      return Promise.resolve(mapMockMemberHistoryPageData())
    },
  }
}
