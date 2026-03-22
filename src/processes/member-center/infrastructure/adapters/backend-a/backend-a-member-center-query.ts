import type { MemberAuthSession } from '@/entities/member-auth'
import { backendAProductRepository } from '@/entities/product'
import { getBackendAOrderSeedRecords } from '@/entities/order/infrastructure/adapters/backend-a/backend-a-order-repository'
import { readBrowserOrderRecords } from '@/entities/order/infrastructure/browser-order-storage'

import type { MemberCenterQuery } from '../../../domain/member-center-query'
import { createBrowserMemberOrderSummaryReader } from '../../create-browser-member-order-summary-reader'
import {
  mapBackendAMemberCardBindPageData,
  mapBackendAMemberCardsPageData,
  mapBackendAMemberCenterPageData,
  mapBackendAMemberFavoritesPageData,
  mapBackendAMemberHistoryPageData,
} from '../../mappers/backend-a-member-center-mapper'

export function createBackendAMemberCenterQuery(memberAuthSession: MemberAuthSession): MemberCenterQuery {
  const getMemberOrderSummary = createBrowserMemberOrderSummaryReader({
    readOrders: () => readBrowserOrderRecords(
      'backend-a',
      memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
      getBackendAOrderSeedRecords,
    ),
  })

  return {
    async getMemberCardBindPageData() {
      return Promise.resolve(mapBackendAMemberCardBindPageData())
    },

    async getMemberCardsPageData() {
      return Promise.resolve(mapBackendAMemberCardsPageData())
    },

    async getMemberCenterPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      return Promise.resolve(mapBackendAMemberCenterPageData(products, getMemberOrderSummary()))
    },

    async getMemberFavoritesPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      return Promise.resolve(mapBackendAMemberFavoritesPageData(products))
    },

    async getMemberHistoryPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      return Promise.resolve(mapBackendAMemberHistoryPageData(products))
    },
  }
}
