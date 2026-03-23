import type { CartRepository, CartSnapshot } from '@/entities/cart'
import type {
  AfterSaleListPageData,
  OrderDetailPageData,
  RefundDetailPageData,
  ReturnDetailPageData,
} from '@/shared/types/modules'

import type { TradeQuery } from '../domain/trade-query'
import type { CartPageData, OrderListPageData } from '../domain/trade-page-data'

interface CreateTradeQueryOptions {
  getAfterSaleListPageData?: () => AfterSaleListPageData | Promise<AfterSaleListPageData>
  cartRepository: CartRepository
  getOrderDetailPageData?: (orderId: string) => OrderDetailPageData | null | Promise<OrderDetailPageData | null>
  getOrderListPageData: () => OrderListPageData | Promise<OrderListPageData>
  getRefundDetailPageData?: (refundId: string) => RefundDetailPageData | null | Promise<RefundDetailPageData | null>
  getReturnDetailPageData?: (refundId: string) => ReturnDetailPageData | null | Promise<ReturnDetailPageData | null>
  mapCartPageData: (snapshot: CartSnapshot) => CartPageData
}

function createEmptyAfterSaleListPageData(): AfterSaleListPageData {
  return {
    query: {
      page: 1,
      pageSize: 10,
      type: 'refund',
    },
    refundPage: {
      hasMore: false,
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
    },
    returnPage: {
      hasMore: false,
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
    },
  }
}

export function createTradeQuery(options: CreateTradeQueryOptions): TradeQuery {
  return {
    async getAfterSaleListPageData() {
      return options.getAfterSaleListPageData
        ? options.getAfterSaleListPageData()
        : createEmptyAfterSaleListPageData()
    },

    async getCartPageData() {
      const snapshot = await options.cartRepository.getSnapshot()
      return options.mapCartPageData(snapshot)
    },

    async getOrderDetailPageData(orderId: string) {
      return options.getOrderDetailPageData ? options.getOrderDetailPageData(orderId) : null
    },

    async getOrderListPageData() {
      return options.getOrderListPageData()
    },

    async getRefundDetailPageData(refundId: string) {
      return options.getRefundDetailPageData ? options.getRefundDetailPageData(refundId) : null
    },

    async getReturnDetailPageData(refundId: string) {
      return options.getReturnDetailPageData ? options.getReturnDetailPageData(refundId) : null
    },
  }
}
