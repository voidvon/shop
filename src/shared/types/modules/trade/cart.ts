export type CartPromotionTag = 'group-buy' | 'flash-sale' | 'mobile-exclusive'

export interface CartGiftItem {
  giftName: string
  quantity: number
}

export interface CartCouponItem {
  couponId: string
  amount: number
  thresholdAmount: number
  expiresAt: string
}

export interface CartLineItem {
  lineId: string
  productId: string
  productName: string
  productImageUrl: string
  addonDescription: string | null
  unitPrice: number
  quantity: number
  selected: boolean
  promotionTags: CartPromotionTag[]
  gifts: CartGiftItem[]
}

export interface CartStoreGroup {
  storeId: string
  storeName: string
  selected: boolean
  couponEntryLabel: string | null
  shippingTip: string | null
  giftPromotionTip: string | null
  coupons: CartCouponItem[]
  items: CartLineItem[]
}

export interface CartPageData {
  isLoggedIn: boolean
  groups: CartStoreGroup[]
  totalAmount: number
}
