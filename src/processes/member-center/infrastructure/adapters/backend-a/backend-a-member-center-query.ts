import type { MemberAuthSession } from '@/entities/member-auth'
import { backendAProductRepository } from '@/entities/product'
import { createBackendAOrderListPageDataReader } from '@/processes/trade/infrastructure/adapters/backend-a/backend-a-trade-readers'

import type { MemberAssetsService } from '../../../domain/member-assets-service'
import type { MemberCenterQuery } from '../../../domain/member-center-query'
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
import type { MemberOrderSummary } from '../../../domain/member-center-page-data'

const emptyMemberOrderSummary: MemberOrderSummary = {
  pendingPaymentCount: 0,
  pendingReceiptCount: 0,
  pendingReviewCount: 0,
  pendingShipmentCount: 0,
  refundAndReturnCount: 0,
}

export function createBackendAMemberCenterQuery(
  memberAuthSession: MemberAuthSession,
  memberAssetsService: MemberAssetsService,
): MemberCenterQuery {
  const getOrderListPageData = createBackendAOrderListPageDataReader(memberAuthSession)

  async function getMemberOrderSummary() {
    const orderListPageData = await getOrderListPageData()

    return orderListPageData.orders.reduce<MemberOrderSummary>((summary, order) => {
      switch (order.status) {
        case 'pending-payment':
          summary.pendingPaymentCount += 1
          break
        case 'pending-shipment':
          summary.pendingShipmentCount += 1
          break
        case 'pending-receipt':
          summary.pendingReceiptCount += 1
          break
        case 'pending-review':
          summary.pendingReviewCount += 1
          break
        case 'refunding':
        case 'returning':
          summary.refundAndReturnCount += 1
          break
        default:
          break
      }

      return summary
    }, { ...emptyMemberOrderSummary })
  }

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
      const memberOrderSummary = await getMemberOrderSummary()
      return Promise.resolve(
        mapBackendAMemberCenterPageData(
          products,
          memberAuthSession.getSnapshot().authResult,
          snapshot.balanceAmount,
          memberOrderSummary,
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
