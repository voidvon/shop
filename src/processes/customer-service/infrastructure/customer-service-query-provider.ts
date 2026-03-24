import { inject, type App, type InjectionKey } from 'vue'

import type { CustomerServiceQuery } from '../domain/customer-service-query'

const customerServiceQueryKey: InjectionKey<CustomerServiceQuery> = Symbol('customer-service-query')

export function provideCustomerServiceQuery(app: App, query: CustomerServiceQuery) {
  app.provide(customerServiceQueryKey, query)
}

export function useCustomerServiceQuery() {
  const query = inject(customerServiceQueryKey)

  if (!query) {
    throw new Error('CustomerServiceQuery is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return query
}
