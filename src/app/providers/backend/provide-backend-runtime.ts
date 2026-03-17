import type { App } from 'vue'

import { provideProductRepository } from '@/entities/product'

import { createBackendRuntime } from './create-backend-runtime'

export function provideBackendRuntime(app: App) {
  const runtime = createBackendRuntime()

  provideProductRepository(app, runtime.productRepository)

  return runtime
}
