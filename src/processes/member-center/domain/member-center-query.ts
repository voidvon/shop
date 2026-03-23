import type {
  MemberAboutPageData,
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberProfileNamePageData,
  MemberSettingsPageData,
} from './member-center-page-data'

export interface MemberCenterQuery {
  getMemberAboutPageData(): Promise<MemberAboutPageData>
  getMemberCardBindPageData(): Promise<MemberCardBindPageData>
  getMemberCardsPageData(): Promise<MemberCardsPageData>
  getMemberCenterPageData(): Promise<MemberCenterPageData>
  getMemberFavoritesPageData(): Promise<MemberFavoritesPageData>
  getMemberHistoryPageData(): Promise<MemberHistoryPageData>
  getMemberProfileNamePageData(): Promise<MemberProfileNamePageData>
  getMemberSettingsPageData(): Promise<MemberSettingsPageData>
}
