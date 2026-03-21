import { backendACartRepository, createEmptyCartSnapshot } from '@/entities/cart'

import type { TradeQuery } from '../../../domain/trade-query'
import {
  mapBackendACartPageData,
  mapBackendAOrderListPageData,
} from '../../mappers/backend-a-trade-mapper'

export const backendATradeQuery: TradeQuery = {
  async getCartPageData() {
    const snapshot = await backendACartRepository.getSnapshot()
    return mapBackendACartPageData(snapshot.lines.length > 0 ? snapshot : createEmptyCartSnapshot())
  },

  async getOrderListPageData() {
    return Promise.resolve(mapBackendAOrderListPageData())
  },
}
