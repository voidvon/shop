export interface FavoriteProduct {
  productId: string
  productName: string
  productImageUrl: string
  productPrice: number
}

export interface FavoriteStore {
  storeId: string
  storeName: string
  storeLogoUrl: string
  favoriteCount: number
  productCount: number
}

export interface BrowsingProduct {
  productId: string
  productName: string
  productImageUrl: string
  productPrice: number
}

export interface MemberCollectionsPageData {
  favoriteProducts: FavoriteProduct[]
  favoriteStores: FavoriteStore[]
  browsingHistory: BrowsingProduct[]
}

export interface FeedbackPageData {
  content: string
  currentLength: number
  maxLength: number
}

export interface FeedbackResult {
  success: boolean
  message: string
}
