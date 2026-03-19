export type TradeOrderStatus =
  | 'all'
  | 'pending-payment'
  | 'pending-shipment'
  | 'pending-receipt'
  | 'pending-review'
  | 'pending-use'
  | 'completed'

export type PaymentChannel = 'recharge-card' | 'predeposit' | 'alipay' | 'wechat-pay'

export interface PaymentOption {
  channel: PaymentChannel
  enabled: boolean
  balanceAmount: number | null
}

export interface PaymentSheetData {
  payableAmount: number
  options: PaymentOption[]
}

export interface TradeOrderItem {
  productId: string
  productName: string
  productImageUrl: string
  skuDescription: string | null
  unitPrice: number
  quantity: number
}

export interface OrderCard {
  orderId: string
  storeId: string
  storeName: string
  status: TradeOrderStatus
  items: TradeOrderItem[]
  itemCount: number
  totalAmount: number
  shippingAmount: number
}

export interface OrderCenterPageData {
  keyword: string
  status: TradeOrderStatus
  orders: OrderCard[]
  paymentSheet: PaymentSheetData | null
}

export interface VirtualOrderListPageData {
  keyword: string
  status: Extract<TradeOrderStatus, 'all' | 'pending-payment' | 'pending-use'>
  orders: OrderCard[]
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
  status: Exclude<TradeOrderStatus, 'all' | 'pending-review' | 'pending-use'>
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
  deliveryRemark: string | null
  buyerMessage: string | null
  invoiceInfo: string | null
  paymentMethod: string | null
  timeline: OrderTimeline
}
