import type { CartPageData, OrderListPageData } from './trade-page-data'

export interface TradeQuery {
  getCartPageData(): Promise<CartPageData>
  getOrderListPageData(): Promise<OrderListPageData>
}
