export type {
  CategoryPageCategory,
  CategoryPageData,
  CategoryPageProductCard,
  HomePageData,
  HomeQuickCategory,
  PageProductCard,
  ProductDetailPageData,
  ProductSkuOption,
  ProductStoreInfo,
} from './domain/storefront-page-data'
export type { StorefrontQuery } from './domain/storefront-query'
export { backendAStorefrontQuery } from './infrastructure/adapters/backend-a/backend-a-storefront-query'
export { mockStorefrontQuery } from './infrastructure/adapters/mock/mock-storefront-query'
export {
  provideStorefrontQuery,
  useStorefrontQuery,
} from './infrastructure/storefront-query-provider'
