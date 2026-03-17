import { inject, type App, type InjectionKey } from 'vue'

import type { OrderRepository } from '../domain/order-repository'

const orderRepositoryKey: InjectionKey<OrderRepository> = Symbol('order-repository')

export function provideOrderRepository(app: App, repository: OrderRepository) {
  app.provide(orderRepositoryKey, repository)
}

export function useOrderRepository() {
  const repository = inject(orderRepositoryKey)

  if (!repository) {
    throw new Error('OrderRepository is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return repository
}
