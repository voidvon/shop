import type { ProductSummary, ProductSummaryPage } from '@/entities/product'

import type {
  CategoryPageCategory,
  CategoryPageProductCard,
  HomePageData,
  HomePartnerStoreType,
  PartnerStoreMerchant,
  PartnerStoreRegion,
  PlatformSettingsData,
  ProductDetailPageData,
  StoreHomePageData,
} from './storefront-page-data'

export interface CategoryProductsQuery {
  categoryId?: string
  keyword?: string
  merchantId?: string
}

export interface StoreProductsQuery {
  categoryId?: string
  maxPrice?: number
  merchantId: string
  minPrice?: number
  perPage?: number
  sortBy?: 'id' | 'price' | 'sales_count'
  sortDir?: 'asc' | 'desc'
}

export interface PartnerStoreMerchantsQuery {
  keyword?: string
  regionId?: string
  storeTypeId?: string
}

export interface StorefrontQuery {
  getCategoryProducts(query?: CategoryProductsQuery): Promise<CategoryPageProductCard[]>
  getCategoryTree(): Promise<CategoryPageCategory[]>
  getHomePageData(): Promise<HomePageData>
  getPartnerMerchants(query?: PartnerStoreMerchantsQuery): Promise<PartnerStoreMerchant[]>
  getPartnerRegions(): Promise<PartnerStoreRegion[]>
  getPartnerStoreTypes(): Promise<HomePartnerStoreType[]>
  getPlatformSettingsData(): Promise<PlatformSettingsData>
  getProductDetailPageData(productId: string): Promise<ProductDetailPageData | null>
  getStoreProductPage(query: StoreProductsQuery): Promise<ProductSummaryPage>
  getStoreProducts(query: StoreProductsQuery): Promise<ProductSummary[]>
  getStoreHomePageData(storeId: string): Promise<StoreHomePageData | null>
}
