import type { App } from 'vue'

import { provideCartRepository } from '@/entities/cart'
import { provideOrderRepository } from '@/entities/order'
import { provideProductRepository } from '@/entities/product'

import { provideBackendRuntimeContext } from './backend-runtime-provider'
import { createBackendRuntime } from './create-backend-runtime'

export function provideBackendRuntime(app: App) {
  const runtime = createBackendRuntime()

  provideBackendRuntimeContext(app, runtime)
  provideCartRepository(app, runtime.cartRepository)
  provideOrderRepository(app, runtime.orderRepository)
  provideProductRepository(app, runtime.productRepository)

  return runtime
}
