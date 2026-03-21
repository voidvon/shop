import type {
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
} from './member-center-page-data'

export interface MemberCenterQuery {
  getMemberCardBindPageData(): Promise<MemberCardBindPageData>
  getMemberCardsPageData(): Promise<MemberCardsPageData>
  getMemberCenterPageData(): Promise<MemberCenterPageData>
  getMemberFavoritesPageData(): Promise<MemberFavoritesPageData>
  getMemberHistoryPageData(): Promise<MemberHistoryPageData>
}
