import { backendACartRepository } from '@/entities/cart'

import {
  mapBackendACartPageData,
  mapBackendAOrderListPageData,
} from '../../mappers/backend-a-trade-mapper'
import { createTradeQuery } from '../../create-trade-query'

export const backendATradeQuery = createTradeQuery({
  cartRepository: backendACartRepository,
  getOrderListPageData: mapBackendAOrderListPageData,
  mapCartPageData: mapBackendACartPageData,
})
