import type { ActionPermission, AmountDetail } from '../base'

export type CartPromotionTag = 'group-buy' | 'flash-sale' | 'mobile-exclusive'

export type CartAction =
  | 'select-store'
  | 'select-item'
  | 'change-quantity'
  | 'delete-item'
  | 'claim-coupon'
  | 'submit-order'

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
  storeId: string
  productId: string
  skuId: string | null
  productName: string
  productImageUrl: string
  addonDescription: string | null
  specText: string | null
  unitPrice: number
  quantity: number
  subtotalAmount: number
  stock: number | null
  selected: boolean
  promotionTags: CartPromotionTag[]
  gifts: CartGiftItem[]
  actions: ActionPermission<CartAction>[]
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
  amountDetails: AmountDetail[]
  actions: ActionPermission<CartAction>[]
}

export interface CartPageData {
  isLoggedIn: boolean
  groups: CartStoreGroup[]
  selectedCount: number
  totalAmount: number
  amountDetails: AmountDetail[]
  actions: ActionPermission<CartAction>[]
}
