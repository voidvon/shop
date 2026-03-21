import type { TradeQuery } from '../../../domain/trade-query'
import {
  mapMockCartPageData,
  mapMockOrderListPageData,
} from '../../mappers/mock-trade-mapper'

export const mockTradeQuery: TradeQuery = {
  async getCartPageData() {
    return Promise.resolve(mapMockCartPageData())
  },

  async getOrderListPageData() {
    return Promise.resolve(mapMockOrderListPageData())
  },
}
