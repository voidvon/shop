import type { ProductDetail } from '@/entities/product'
import type { TradeOrderStatus } from '@/shared/types/modules'

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

export interface CategoryPageData {
  primaryCategories: CategoryPageCategory[]
  products: CategoryPageProductCard[]
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

export interface CartPageItem {
  lineId: string
  productId: string
  productImageUrl: string | null
  productName: string
  quantity: number
  unitPrice: number
}

export interface CartPageGroup {
  items: CartPageItem[]
  storeId: string
  storeName: string
}

export interface CartPageData {
  groups: CartPageGroup[]
  totalAmount: number
}

export interface OrderListItem {
  orderItemId: string
  productImageUrl: string | null
  productName: string
  quantity: number
  unitPrice: number
}

export interface OrderListEntry {
  itemCount: number
  items: OrderListItem[]
  orderId: string
  orderNo: string
  shippingAmount: number
  status: TradeOrderStatus
  statusText: string
  storeName: string
  totalAmount: number
}

export interface OrderListPageData {
  keyword: string
  orders: OrderListEntry[]
}

export interface MemberCenterCountSummary {
  browsingCount: number
  cartCount: number
  favoritesCount: number
}

export interface MemberOrderSummary {
  pendingPaymentCount: number
  pendingReceiptCount: number
  pendingReviewCount: number
  pendingShipmentCount: number
  refundAndReturnCount: number
}

export interface MemberProfileInfo {
  avatarUrl: string | null
  isLoggedIn: boolean
  username: string | null
}

export interface MemberShortcut {
  key: string
  label: string
  route: string
}

export interface MemberCenterPageData {
  counts: MemberCenterCountSummary
  orderSummary: MemberOrderSummary
  profile: MemberProfileInfo
  servicePhone: string
  shortcuts: MemberShortcut[]
  tipText: string
}

export interface MemberCardsPageData {
  balanceAmount: number
  cardNumber: string | null
}

export interface MemberCardBindPageData {
  cardNumber: string | null
}

export interface MemberProductListItem {
  productId: string
  productImageUrl: string | null
  productName: string
  productPrice: number
  storeName: string
}

export interface MemberFavoritesPageData {
  items: MemberProductListItem[]
}

export interface MemberHistoryPageData {
  items: MemberProductListItem[]
}
