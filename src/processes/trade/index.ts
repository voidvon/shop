export type {
  CartPageData,
  OrderListEntry,
  OrderListPageData,
} from './domain/trade-page-data'
export type { TradeQuery } from './domain/trade-query'
export { backendATradeQuery } from './infrastructure/adapters/backend-a/backend-a-trade-query'
export { mockTradeQuery } from './infrastructure/adapters/mock/mock-trade-query'
export {
  provideTradeQuery,
  useTradeQuery,
} from './infrastructure/trade-query-provider'
