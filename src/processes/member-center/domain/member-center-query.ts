import type {
  MemberAboutPageData,
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberPaymentCodePageData,
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
  getMemberPaymentCodePageData(): Promise<MemberPaymentCodePageData>
  getMemberProfileNamePageData(): Promise<MemberProfileNamePageData>
  getMemberSettingsPageData(): Promise<MemberSettingsPageData>
}
