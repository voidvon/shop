import type { CursorPageResult } from '../base'

export interface PublicBannerItem {
  imageUrl: string
  linkUrl: string
  eyebrow?: string | null
  title?: string | null
  description?: string | null
}

export interface HomeCategoryEntry {
  categoryId: string
  categoryName: string
  imageUrl: string | null
}

export interface PublicProductCard {
  marketPrice: number | null
  monthlySales: number
  productId: string
  productImageUrl: string
  productName: string
  price: number
}

export interface HomePageData {
  banners: PublicBannerItem[]
  categoryEntries: HomeCategoryEntry[]
  productFeed: CursorPageResult<PublicProductCard>
}

export interface SearchPageData {
  hotKeywords: string[]
  historyKeywords: string[]
}

export interface StoreAreaItem {
  areaId: string
  areaName: string
}

export interface StoreSummary {
  storeId: string
  storeName: string
  phone: string | null
  businessHours: string | null
  address: string
}

export interface StoreAreaPageData {
  areas: StoreAreaItem[]
  selectedAreaId: string | null
  storeFeed: CursorPageResult<StoreSummary>
}
