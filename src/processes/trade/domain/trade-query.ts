import type {
  AfterSaleListPageData,
  OrderDetailPageData,
  RefundDetailPageData,
  ReturnDetailPageData,
} from '@/shared/types/modules'

import type { CartPageData, OrderListPageData } from './trade-page-data'

export interface TradeQuery {
  getAfterSaleListPageData(): Promise<AfterSaleListPageData>
  getCartPageData(): Promise<CartPageData>
  getOrderDetailPageData(orderId: string): Promise<OrderDetailPageData | null>
  getOrderListPageData(): Promise<OrderListPageData>
  getRefundDetailPageData(refundId: string): Promise<RefundDetailPageData | null>
  getReturnDetailPageData(refundId: string): Promise<ReturnDetailPageData | null>
}
