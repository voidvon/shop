import type { ActionPermission, AmountDetail, PageQuery, PageResult } from '../base'

export type ProductListSortKey = 'default' | 'sales' | 'price'

export type ProductListDisplayMode = 'grid' | 'list'

export type ProductPurchaseAction = 'add-to-cart' | 'buy-now' | 'favorite'

export interface ProductListFilters {
  keyword: string | null
  categoryId: string | null
  brandId: string | null
  areaId: string | null
  priceFrom: number | null
  priceTo: number | null
  ownShopOnly: boolean
  giftOnly: boolean
  groupBuyOnly: boolean
  flashSaleOnly: boolean
  virtualOnly: boolean
}

export interface ProductListItem {
  productId: string
  storeId: string
  skuId: string | null
  productImageUrl: string
  productName: string
  price: number
  marketPrice: number | null
  storeName: string
  isOwnShop: boolean
  isVirtual: boolean
  isPresell: boolean
  isFCode: boolean
  hasGift: boolean
  isGroupBuy: boolean
  isFlashSale: boolean
}

export interface ProductListQuery extends PageQuery {
  filters: ProductListFilters
  sortKey: ProductListSortKey
  displayMode: ProductListDisplayMode
}

export interface ProductListPageData {
  query: ProductListQuery
  productPage: PageResult<ProductListItem>
}

export interface ProductSpecValue {
  valueId: string
  valueLabel: string
  isSelected: boolean
}

export interface ProductSpecGroup {
  groupId: string
  groupLabel: string
  values: ProductSpecValue[]
}

export interface ProductSkuSnapshot {
  skuId: string
  specText: string
  price: number
  marketPrice: number | null
  stock: number
  available: boolean
}

export interface ProductReviewSnippet {
  username: string
  score: number
  content: string
  createdAt: string
}

export interface ProductStoreScore {
  descriptionScore: number
  serviceScore: number
  deliveryScore: number
}

export interface ProductStoreSummary {
  storeId: string
  storeName: string
  isOwnShop: boolean
  address: string | null
  phone: string | null
  businessHours: string | null
  score: ProductStoreScore
}

export interface ProductCouponSummary {
  couponId: string
  couponName: string
  discountAmount: number
}

export interface ProductRecommendation {
  productId: string
  productName: string
  productImageUrl: string
  price: number
}

export interface ProductDetailPageData {
  productId: string
  productName: string
  subtitle: string | null
  sellingPoints: string[]
  gallery: string[]
  defaultSkuId: string | null
  selectedSkuId: string | null
  skuList: ProductSkuSnapshot[]
  stock: number
  price: number
  marketPrice: number | null
  amountDetails: AmountDetail[]
  specGroups: ProductSpecGroup[]
  quantity: number
  reviewRate: number | null
  reviewCount: number
  reviewSnippets: ProductReviewSnippet[]
  store: ProductStoreSummary
  recommendations: ProductRecommendation[]
  coupons: ProductCouponSummary[]
  actions: ActionPermission<ProductPurchaseAction>[]
}

export interface ProductInfoPageData {
  productId: string
  htmlContent: string
}

export interface ProductEvaluationItem {
  evaluationId: string
  memberAvatarUrl: string | null
  memberName: string
  createdAt: string
  score: number
  content: string
  imageThumbUrls: string[]
  imageUrls: string[]
  explanation: string | null
  appendContent: string | null
  appendCreatedAt: string | null
  appendImageThumbUrls: string[]
  appendImageUrls: string[]
  appendExplanation: string | null
}

export interface ProductEvaluationPageData {
  productId: string
  filter: 'all' | 'positive' | 'neutral' | 'negative' | 'with-image'
  evaluationPage: PageResult<ProductEvaluationItem>
}
