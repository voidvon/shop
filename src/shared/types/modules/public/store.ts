export type StoreHomeTabKey = 'home' | 'all-products' | 'new-products' | 'promotions'

export interface StoreRecommendProduct {
  productId: string
  productName: string
  productImageUrl: string
  price: number
}

export interface StoreHomeData {
  storeId: string
  storeName: string
  storeLogoUrl: string | null
  followerCount: number
  benefitTips: string[]
  isFavorited: boolean
  tabs: StoreHomeTabKey[]
  recommendedProducts: StoreRecommendProduct[]
}
