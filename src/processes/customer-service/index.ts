export type {
  AppendCustomerServiceMessageCommand,
  CreateCustomerServiceConversationCommand,
  CustomerServiceConversationDetail,
  CustomerServiceConversationStatus,
  CustomerServiceConversationSummary,
  CustomerServiceMessage,
  CustomerServiceMessageIncrementQuery,
  CustomerServiceMessageSenderRole,
  CustomerServiceUnreadSummary,
} from './domain/customer-service'
export type { CustomerServiceQuery } from './domain/customer-service-query'
export { createBackendACustomerServiceQuery } from './infrastructure/adapters/backend-a/backend-a-customer-service-query'
export { createMockCustomerServiceQuery } from './infrastructure/adapters/mock/mock-customer-service-query'
export {
  provideCustomerServiceQuery,
  useCustomerServiceQuery,
} from './infrastructure/customer-service-query-provider'
