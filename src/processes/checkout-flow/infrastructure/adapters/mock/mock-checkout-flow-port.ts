import { mockCartRepository } from '@/entities/cart'
import { mockOrderRepository } from '@/entities/order'
import { mockProductRepository } from '@/entities/product'

import { createCheckoutFlowPort } from '../../create-checkout-flow-port'

export const mockCheckoutFlowPort = createCheckoutFlowPort({
  cartRepository: mockCartRepository,
  isCartEnabled: true,
  orderRepository: mockOrderRepository,
  productRepository: mockProductRepository,
})
