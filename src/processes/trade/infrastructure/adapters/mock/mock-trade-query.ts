import { mockCartRepository } from '@/entities/cart'

import {
  mapMockCartPageData,
  mapMockOrderListPageData,
} from '../../mappers/mock-trade-mapper'
import { createTradeQuery } from '../../create-trade-query'

export const mockTradeQuery = createTradeQuery({
  cartRepository: mockCartRepository,
  getOrderListPageData: mapMockOrderListPageData,
  mapCartPageData: mapMockCartPageData,
})
