import { createBackendACartRepository } from '@/entities/cart'
import type { MemberAuthSession } from '@/entities/member-auth'
import { createBackendAOrderRepository } from '@/entities/order'
import { backendAProductRepository } from '@/entities/product'

import { createCheckoutFlowPort } from '../../create-checkout-flow-port'

export function createBackendACheckoutFlowPort(memberAuthSession: MemberAuthSession) {
  return createCheckoutFlowPort({
    allowInstantFallback: false,
    cartRepository: createBackendACartRepository(memberAuthSession),
    clearCartAfterSubmit: false,
    isCartEnabled: true,
    orderRepository: createBackendAOrderRepository(memberAuthSession),
    productRepository: backendAProductRepository,
  })
}
