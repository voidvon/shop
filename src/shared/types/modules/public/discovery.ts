export interface PublicBannerItem {
  imageUrl: string
  linkUrl: string
}

export interface HomeCategoryEntry {
  categoryId: string
  categoryName: string
  imageUrl: string | null
}

export interface PublicProductCard {
  productId: string
  productName: string
  productImageUrl: string
  price: number
  marketPrice: number | null
}

export interface HomePageData {
  banners: PublicBannerItem[]
  categoryEntries: HomeCategoryEntry[]
  products: PublicProductCard[]
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
  stores: StoreSummary[]
}
