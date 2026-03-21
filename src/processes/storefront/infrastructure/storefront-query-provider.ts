import { inject, type App, type InjectionKey } from 'vue'

import type { StorefrontQuery } from '../domain/storefront-query'

const storefrontQueryKey: InjectionKey<StorefrontQuery> = Symbol('storefront-query')

export function provideStorefrontQuery(app: App, query: StorefrontQuery) {
  app.provide(storefrontQueryKey, query)
}

export function useStorefrontQuery() {
  const query = inject(storefrontQueryKey)

  if (!query) {
    throw new Error('StorefrontQuery is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return query
}
