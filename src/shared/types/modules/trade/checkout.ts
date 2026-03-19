import type { ActionPermission, AmountDetail } from '../base'
import type { PaymentChannel, PaymentSheetData } from './order'

export type CheckoutAction = 'select-address' | 'select-coupon' | 'change-payment' | 'submit-order'

export type CheckoutSource =
  | {
      type: 'cart'
      cartLineIds: string[]
    }
  | {
      type: 'instant'
      item: InstantPurchaseItem
    }

export interface InstantPurchaseItem {
  productId: string
  skuId: string | null
  quantity: number
}

export interface CheckoutAddress {
  addressId: string
  recipientName: string
  recipientPhone: string
  address: string
  isDefault: boolean
}

export interface CheckoutCoupon {
  couponId: string
  couponName: string
  amount: number
  thresholdAmount: number
  selected: boolean
}

export interface CheckoutLineItem {
  cartLineId: string | null
  productId: string
  skuId: string | null
  productName: string
  productImageUrl: string
  specText: string | null
  unitPrice: number
  quantity: number
  subtotalAmount: number
}

export interface CheckoutStoreGroup {
  storeId: string
  storeName: string
  items: CheckoutLineItem[]
  deliveryFee: number
  availableCoupons: CheckoutCoupon[]
  selectedCouponId: string | null
  amountDetails: AmountDetail[]
}

export interface CheckoutPreview {
  source: CheckoutSource
  address: CheckoutAddress | null
  storeGroups: CheckoutStoreGroup[]
  goodsAmount: number
  shippingAmount: number
  discountAmount: number
  payableAmount: number
  amountDetails: AmountDetail[]
  availablePaymentChannels: PaymentChannel[]
  actions: ActionPermission<CheckoutAction>[]
}

export interface SubmitOrderStoreSettlement {
  storeId: string
  couponId: string | null
  buyerMessage: string | null
}

export interface SubmitOrderCommand {
  source: CheckoutSource
  addressId: string
  settlements: SubmitOrderStoreSettlement[]
  paymentChannel: PaymentChannel | null
}

export interface SubmitOrderResult {
  orderIds: string[]
  paymentSheet: PaymentSheetData | null
  redirectUrl: string | null
}
