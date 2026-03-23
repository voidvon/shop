import { inject, type App, type InjectionKey } from 'vue'

import type { AfterSaleRepository } from '../domain/after-sale-repository'

const afterSaleRepositoryKey: InjectionKey<AfterSaleRepository> = Symbol('after-sale-repository')

export function provideAfterSaleRepository(app: App, repository: AfterSaleRepository) {
  app.provide(afterSaleRepositoryKey, repository)
}

export function useAfterSaleRepository() {
  const repository = inject(afterSaleRepositoryKey)

  if (!repository) {
    throw new Error('AfterSaleRepository is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return repository
}
