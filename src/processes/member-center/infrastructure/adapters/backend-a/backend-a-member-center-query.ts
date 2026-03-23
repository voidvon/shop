import type { MemberAuthSession } from '@/entities/member-auth'
import { backendAProductRepository } from '@/entities/product'
import { getBackendAOrderSeedRecords } from '@/entities/order/infrastructure/adapters/backend-a/backend-a-order-repository'
import { readBrowserOrderRecords } from '@/entities/order/infrastructure/browser-order-storage'

import type { MemberAssetsService } from '../../../domain/member-assets-service'
import type { MemberCenterQuery } from '../../../domain/member-center-query'
import { createBrowserMemberOrderSummaryReader } from '../../create-browser-member-order-summary-reader'
import {
  mapBackendAMemberAboutPageData,
  mapBackendAMemberCardBindPageData,
  mapBackendAMemberCardsPageData,
  mapBackendAMemberCenterPageData,
  mapBackendAMemberFavoritesPageData,
  mapBackendAMemberHistoryPageData,
  mapBackendAMemberProfileNamePageData,
  mapBackendAMemberSettingsPageData,
} from '../../mappers/backend-a-member-center-mapper'

export function createBackendAMemberCenterQuery(
  memberAuthSession: MemberAuthSession,
  memberAssetsService: MemberAssetsService,
): MemberCenterQuery {
  const scopeKey = () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest'
  const getMemberOrderSummary = createBrowserMemberOrderSummaryReader({
    readOrders: () => readBrowserOrderRecords(
      'backend-a',
      scopeKey(),
      getBackendAOrderSeedRecords,
    ),
  })

  return {
    async getMemberAboutPageData() {
      return Promise.resolve(mapBackendAMemberAboutPageData())
    },

    async getMemberCardBindPageData() {
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(mapBackendAMemberCardBindPageData(snapshot.bindPage))
    },

    async getMemberCardsPageData() {
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(mapBackendAMemberCardsPageData(snapshot))
    },

    async getMemberCenterPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(
        mapBackendAMemberCenterPageData(
          products,
          memberAuthSession.getSnapshot().authResult,
          snapshot.balanceAmount,
          getMemberOrderSummary(),
        ),
      )
    },

    async getMemberFavoritesPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      return Promise.resolve(mapBackendAMemberFavoritesPageData(products))
    },

    async getMemberHistoryPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      return Promise.resolve(mapBackendAMemberHistoryPageData(products))
    },

    async getMemberProfileNamePageData() {
      return Promise.resolve(mapBackendAMemberProfileNamePageData(memberAuthSession.getSnapshot().authResult))
    },

    async getMemberSettingsPageData() {
      return Promise.resolve(mapBackendAMemberSettingsPageData(memberAuthSession.getSnapshot().authResult))
    },
  }
}
