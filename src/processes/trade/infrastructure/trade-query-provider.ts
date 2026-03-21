import { inject, type App, type InjectionKey } from 'vue'

import type { TradeQuery } from '../domain/trade-query'

const tradeQueryKey: InjectionKey<TradeQuery> = Symbol('trade-query')

export function provideTradeQuery(app: App, query: TradeQuery) {
  app.provide(tradeQueryKey, query)
}

export function useTradeQuery() {
  const query = inject(tradeQueryKey)

  if (!query) {
    throw new Error('TradeQuery is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return query
}
