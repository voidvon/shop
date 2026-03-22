import { mockCartRepository } from '@/entities/cart'

import type { TradeQuery } from '../../../domain/trade-query'
import {
  mapMockCartPageData,
  mapMockOrderListPageData,
} from '../../mappers/mock-trade-mapper'

export const mockTradeQuery: TradeQuery = {
  async getCartPageData() {
    const snapshot = await mockCartRepository.getSnapshot()
    return Promise.resolve(mapMockCartPageData(snapshot))
  },

  async getOrderListPageData() {
    return Promise.resolve(mapMockOrderListPageData())
  },
}
