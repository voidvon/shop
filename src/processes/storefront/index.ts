export type {
  CategoryPageCategory,
  CategoryPageProductCard,
  HomePageData,
  HomePartnerStoreType,
  HomeQuickCategory,
  PartnerStoreMerchant,
  PartnerStoreRegion,
  PageProductCard,
  PlatformSettingsData,
  ProductDetailPageData,
  ProductSkuOption,
  ProductStoreInfo,
  StoreHomePageData,
  StoreHomeTabKey,
} from './domain/storefront-page-data'
export type {
  CategoryProductsQuery,
  PartnerStoreMerchantsQuery,
  StoreProductsQuery,
  StorefrontQuery,
} from './domain/storefront-query'
export { backendAStorefrontQuery } from './infrastructure/adapters/backend-a/backend-a-storefront-query'
export { mockStorefrontQuery } from './infrastructure/adapters/mock/mock-storefront-query'
export {
  provideStorefrontQuery,
  useStorefrontQuery,
} from './infrastructure/storefront-query-provider'
