import type { CartRepository, CartSnapshot } from '@/entities/cart'

import type { TradeQuery } from '../domain/trade-query'
import type { CartPageData, OrderListPageData } from '../domain/trade-page-data'

interface CreateTradeQueryOptions {
  cartRepository: CartRepository
  getOrderListPageData: () => OrderListPageData | Promise<OrderListPageData>
  mapCartPageData: (snapshot: CartSnapshot) => CartPageData
}

export function createTradeQuery(options: CreateTradeQueryOptions): TradeQuery {
  return {
    async getCartPageData() {
      const snapshot = await options.cartRepository.getSnapshot()
      return options.mapCartPageData(snapshot)
    },

    async getOrderListPageData() {
      return options.getOrderListPageData()
    },
  }
}
