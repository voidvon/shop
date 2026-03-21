export type {
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberProductListItem,
} from './domain/member-center-page-data'
export type { MemberCenterQuery } from './domain/member-center-query'
export { backendAMemberCenterQuery } from './infrastructure/adapters/backend-a/backend-a-member-center-query'
export { mockMemberCenterQuery } from './infrastructure/adapters/mock/mock-member-center-query'
export {
  provideMemberCenterQuery,
  useMemberCenterQuery,
} from './infrastructure/member-center-query-provider'
