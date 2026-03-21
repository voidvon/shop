import { backendAProductRepository } from '@/entities/product'

import type { MemberCenterQuery } from '../../../domain/member-center-query'
import {
  mapBackendAMemberCardBindPageData,
  mapBackendAMemberCardsPageData,
  mapBackendAMemberCenterPageData,
  mapBackendAMemberFavoritesPageData,
  mapBackendAMemberHistoryPageData,
} from '../../mappers/backend-a-member-center-mapper'

export const backendAMemberCenterQuery: MemberCenterQuery = {
  async getMemberCardBindPageData() {
    return Promise.resolve(mapBackendAMemberCardBindPageData())
  },

  async getMemberCardsPageData() {
    return Promise.resolve(mapBackendAMemberCardsPageData())
  },

  async getMemberCenterPageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()
    return Promise.resolve(mapBackendAMemberCenterPageData(products))
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
