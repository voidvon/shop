import type { MemberAuthSession } from '@/entities/member-auth'
import { getMockOrderSeedRecords } from '@/entities/order/infrastructure/adapters/mock/mock-order-repository'
import { readBrowserOrderRecords } from '@/entities/order/infrastructure/browser-order-storage'

import type { MemberAssetsService } from '../../../domain/member-assets-service'
import type { MemberCenterQuery } from '../../../domain/member-center-query'
import { createBrowserMemberOrderSummaryReader } from '../../create-browser-member-order-summary-reader'
import {
  mapMockMemberAboutPageData,
  mapMockMemberCardBindPageData,
  mapMockMemberCardsPageData,
  mapMockMemberCenterPageData,
  mapMockMemberCouponsPageData,
  mapMockMemberFavoritesPageData,
  mapMockMemberHistoryPageData,
  mapMockMemberPaymentCodePageData,
  mapMockMemberProfileNamePageData,
  mapMockMemberSettingsPageData,
} from '../../mappers/mock-member-center-mapper'

export function createMockMemberCenterQuery(
  memberAuthSession: MemberAuthSession,
  memberAssetsService: MemberAssetsService,
): MemberCenterQuery {
  const scopeKey = () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest'
  const getMemberOrderSummary = createBrowserMemberOrderSummaryReader({
    readOrders: () => readBrowserOrderRecords(
      'mock',
      scopeKey(),
      getMockOrderSeedRecords,
    ),
  })

  return {
    async getMemberAboutPageData() {
      return Promise.resolve(mapMockMemberAboutPageData())
    },

    async getMemberCardBindPageData() {
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(mapMockMemberCardBindPageData(snapshot.bindPage))
    },

    async getMemberCardsPageData() {
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(mapMockMemberCardsPageData(snapshot))
    },

    async getMemberCenterPageData() {
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(
        mapMockMemberCenterPageData(
          memberAuthSession.getSnapshot().authResult,
          snapshot.balanceAmount,
          getMemberOrderSummary(),
        ),
      )
    },

    async getMemberCouponsPageData() {
      return Promise.resolve(mapMockMemberCouponsPageData())
    },

    async getMemberFavoritesPageData() {
      return Promise.resolve(mapMockMemberFavoritesPageData())
    },

    async getMemberHistoryPageData() {
      return Promise.resolve(mapMockMemberHistoryPageData())
    },

    async getMemberPaymentCodePageData() {
      return Promise.resolve(mapMockMemberPaymentCodePageData())
    },

    async getMemberProfileNamePageData() {
      return Promise.resolve(mapMockMemberProfileNamePageData(memberAuthSession.getSnapshot().authResult))
    },

    async getMemberSettingsPageData() {
      return Promise.resolve(mapMockMemberSettingsPageData(memberAuthSession.getSnapshot().authResult))
    },
  }
}
