import { inject, type App, type InjectionKey } from 'vue'

import type { ProductRepository } from '../domain/product-repository'

const productRepositoryKey: InjectionKey<ProductRepository> = Symbol('product-repository')

export function provideProductRepository(app: App, repository: ProductRepository) {
  app.provide(productRepositoryKey, repository)
}

export function useProductRepository() {
  const repository = inject(productRepositoryKey)

  if (!repository) {
    throw new Error('ProductRepository is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return repository
}
