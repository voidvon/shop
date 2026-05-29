import type { ProductDetail, ProductSummary } from '@/entities/product'

export interface PageProductCard {
  id: string
  imageUrl: string | null
  marketPrice: number | null
  marketPriceText?: string | null
  monthlySales: number
  name: string
  price: number
  priceText?: string | null
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

export interface HomePartnerStoreType {
  id: string
  imageUrl: string | null
  label: string
}

export interface PartnerStoreRegion {
  id: string
  label: string
}

export interface PartnerStoreMerchant {
  address: string
  businessHours: string | null
  id: string
  imageUrl: string | null
  name: string
  phone: string | null
  regionName: string | null
  shortName: string | null
  storeTypeLabels: string[]
}

export interface MerchantCoupon {
  discountAmount: number | null
  discountRate: number | null
  endsAt: string | null
  id: string
  merchantId: string
  minimumAmount: number
  name: string
  perUserLimit: number
  scopeType: string
  startsAt: string | null
  totalQuantity: number | null
  type: string
  userCouponsCount: number
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
  partnerStoreTypes: HomePartnerStoreType[]
  promo_video: string | null
  quickCategories: HomeQuickCategory[]
}

export interface PlatformSettingsData {
  address: string | null
  businessPhone: string | null
  companyName: string
  customerServicePhone: string | null
  customerServiceWechat: string | null
  domain: string | null
  icpNumber: string | null
  logoUrl: string | null
  showSalesCount: boolean
}

export type StoreHomeTabKey = 'home' | 'all-products' | 'new-products' | 'promotions'

export interface StoreHomePageData {
  address: string | null
  benefitTips: string[]
  businessHours: string | null
  followerCount: number
  isFavorited: boolean
  phone: string | null
  products: ProductSummary[]
  shippingTip: string | null
  storeId: string
  storeLogoUrl: string | null
  storeName: string
  summary: string | null
  tabs: StoreHomeTabKey[]
}

export interface ProductSkuOption {
  available: boolean
  imageUrl: string | null
  marketPrice: number | null
  marketPriceText?: string | null
  price: number
  priceText?: string | null
  skuId: string
  specText: string
  stock: number
  thirdPartyGoodsTypeLabel?: string | null
  virtualDailyPurchaseLimit?: number | null
  virtualOrderQuantityLimit?: number | null
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
