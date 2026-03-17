import { inject, type App, type InjectionKey } from 'vue'

import type { CartRepository } from '../domain/cart-repository'

const cartRepositoryKey: InjectionKey<CartRepository> = Symbol('cart-repository')

export function provideCartRepository(app: App, repository: CartRepository) {
  app.provide(cartRepositoryKey, repository)
}

export function useCartRepository() {
  const repository = inject(cartRepositoryKey)

  if (!repository) {
    throw new Error('CartRepository is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return repository
}
