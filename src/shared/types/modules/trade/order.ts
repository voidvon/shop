import type { ActionPermission, AmountDetail, PageQuery, PageResult } from '../base'

export type TradeOrderStatus =
  | 'all'
  | 'pending-payment'
  | 'pending-shipment'
  | 'pending-receipt'
  | 'pending-review'
  | 'pending-use'
  | 'completed'
  | 'cancelled'
  | 'refunding'
  | 'returning'

export type TradeOrderType = 'physical' | 'virtual'

export type TradeOrderAction =
  | 'pay'
  | 'cancel'
  | 'view-logistics'
  | 'confirm-receipt'
  | 'review'
  | 'remove'
  | 'refund'
  | 'return'
  | 'contact-store'
  | 'copy-order-no'

export type PaymentChannel = 'recharge-card' | 'predeposit' | 'alipay' | 'wechat-pay'

export interface PaymentOption {
  channel: PaymentChannel
  enabled: boolean
  balanceAmount: number | null
  passwordRequired: boolean
}

export interface PaymentSheetData {
  orderIds: string[]
  payableAmount: number
  options: PaymentOption[]
}

export interface TradeOrderItem {
  orderItemId: string
  storeId: string
  productId: string
  skuId: string | null
  productName: string
  productImageUrl: string
  skuDescription: string | null
  unitPrice: number
  quantity: number
  subtotalAmount: number
  afterSaleStatus: string | null
  actions: ActionPermission<TradeOrderAction>[]
}

export interface OrderCard {
  orderId: string
  orderNo: string
  orderType: TradeOrderType
  storeId: string
  storeName: string
  status: TradeOrderStatus
  statusText: string
  items: TradeOrderItem[]
  itemCount: number
  totalAmount: number
  shippingAmount: number
  amountDetails: AmountDetail[]
  actions: ActionPermission<TradeOrderAction>[]
}

export interface OrderCenterQuery extends PageQuery {
  keyword: string
  status: TradeOrderStatus
  orderType: TradeOrderType
}

export interface OrderCenterPageData {
  query: OrderCenterQuery
  orderPage: PageResult<OrderCard>
  paymentSheet: PaymentSheetData | null
}

export interface VirtualOrderListPageData {
  query: Omit<OrderCenterQuery, 'orderType'> & {
    status: Extract<TradeOrderStatus, 'all' | 'pending-payment' | 'pending-use'>
  }
  orderPage: PageResult<OrderCard>
  paymentSheet: PaymentSheetData | null
}

export interface LogisticsSummary {
  title: string
  description: string
  updatedAt: string
}

export interface OrderAddress {
  recipientName: string
  recipientPhone: string
  address: string
}

export interface OrderGiftItem {
  giftName: string
  quantity: number
}

export interface OrderPromotionInfo {
  label: string
  description: string
}

export interface OrderTimeline {
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  completedAt: string | null
}

export interface OrderDetailPageData {
  orderId: string
  orderNo: string
  orderType: TradeOrderType
  status: Exclude<TradeOrderStatus, 'all'>
  statusText: string
  statusHint: string
  logistics: LogisticsSummary | null
  address: OrderAddress
  storeId: string
  storeName: string
  items: TradeOrderItem[]
  gifts: OrderGiftItem[]
  promotions: OrderPromotionInfo[]
  payableAmount: number
  shippingAmount: number
  amountDetails: AmountDetail[]
  deliveryRemark: string | null
  buyerMessage: string | null
  invoiceInfo: string | null
  paymentMethod: string | null
  timeline: OrderTimeline
  actions: ActionPermission<TradeOrderAction>[]
}
