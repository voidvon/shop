import type { MemberCenterQuery } from '../../../domain/member-center-query'
import {
  mapMockMemberCardBindPageData,
  mapMockMemberCardsPageData,
  mapMockMemberCenterPageData,
  mapMockMemberFavoritesPageData,
  mapMockMemberHistoryPageData,
} from '../../mappers/mock-member-center-mapper'

export const mockMemberCenterQuery: MemberCenterQuery = {
  async getMemberCardBindPageData() {
    return Promise.resolve(mapMockMemberCardBindPageData())
  },

  async getMemberCardsPageData() {
    return Promise.resolve(mapMockMemberCardsPageData())
  },

  async getMemberCenterPageData() {
    return Promise.resolve(mapMockMemberCenterPageData())
  },

  async getMemberFavoritesPageData() {
    return Promise.resolve(mapMockMemberFavoritesPageData())
  },

  async getMemberHistoryPageData() {
    return Promise.resolve(mapMockMemberHistoryPageData())
  },
}
