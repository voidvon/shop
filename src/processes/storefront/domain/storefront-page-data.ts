import type { ProductDetail } from '@/entities/product'

export interface PageProductCard {
  id: string
  imageUrl: string | null
  marketPrice: number | null
  name: string
  price: number
}

export interface CategoryPageCategory {
  id: string
  label: string
  imageUrl: string | null
  children: CategoryPageCategory[]
}

export interface CategoryPageProductCard extends PageProductCard {
  categoryId: string
  categoryName: string
}

export interface HomeQuickCategory {
  id: string
  imageUrl: string | null
  label: string
}

export interface HomeBanner {
  description: string
  eyebrow: string
  imageUrl: string | null
  linkUrl: string
  title: string
}

export interface HomePageData {
  banners: HomeBanner[]
  featuredProducts: PageProductCard[]
  promo_video: string | null
  quickCategories: HomeQuickCategory[]
}

export interface ProductSkuOption {
  available: boolean
  marketPrice: number | null
  price: number
  skuId: string
  specText: string
  stock: number
}

export interface ProductStoreScore {
  deliveryScore: number
  descriptionScore: number
  serviceScore: number
}

export interface ProductStoreInfo {
  score: ProductStoreScore
  storeId: string
  storeName: string
}

export interface ProductReviewSummary {
  count: number
  rate: number | null
}

export interface ProductDetailPageData {
  defaultSkuId: string | null
  product: ProductDetail
  quantity: number
  recommendations: PageProductCard[]
  review: ProductReviewSummary
  selectedSkuId: string | null
  skuList: ProductSkuOption[]
  store: ProductStoreInfo | null
}
