import { backendACartRepository } from '@/entities/cart'
import { backendAOrderRepository } from '@/entities/order'
import { backendAProductRepository } from '@/entities/product'

import { createCheckoutFlowPort } from '../../create-checkout-flow-port'

export const backendACheckoutFlowPort = createCheckoutFlowPort({
  cartRepository: backendACartRepository,
  isCartEnabled: true,
  orderRepository: backendAOrderRepository,
  productRepository: backendAProductRepository,
})
