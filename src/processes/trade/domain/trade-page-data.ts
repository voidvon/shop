import type { TradeOrderStatus } from '@/shared/types/modules'

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
