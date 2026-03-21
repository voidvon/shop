export type {
  CartPageData,
  CategoryPageCategory,
  CategoryPageData,
  CategoryPageProductCard,
  HomePageData,
  HomeQuickCategory,
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberProductListItem,
  OrderListPageData,
  OrderListEntry,
  PageProductCard,
  ProductDetailPageData,
  ProductSkuOption,
  ProductStoreInfo,
} from './domain/page-content'
export type { PageContentGateway } from './domain/page-content-gateway'
export { backendAPageContentGateway } from './infrastructure/adapters/backend-a/backend-a-page-content-gateway'
export { mockPageContentGateway } from './infrastructure/adapters/mock/mock-page-content-gateway'
export {
  providePageContentGateway,
  usePageContentGateway,
} from './infrastructure/page-content-gateway-provider'
