import type {
  AppendCustomerServiceMessageCommand,
  CreateCustomerServiceConversationCommand,
  CustomerServiceConversationDetail,
  CustomerServiceConversationSummary,
  CustomerServiceMessage,
  CustomerServiceMessageIncrementQuery,
  CustomerServiceUnreadSummary,
} from './customer-service'

export interface CustomerServiceQuery {
  appendConversationMessage(command: AppendCustomerServiceMessageCommand): Promise<void>
  createConversation(command: CreateCustomerServiceConversationCommand): Promise<string>
  getConversationDetail(conversationId: string): Promise<CustomerServiceConversationDetail | null>
  getConversationIncrement(query: CustomerServiceMessageIncrementQuery): Promise<CustomerServiceMessage[]>
  getConversationList(query?: { perPage?: number }): Promise<CustomerServiceConversationSummary[]>
  getConversationMessages(conversationId: string, query?: { perPage?: number }): Promise<CustomerServiceMessage[]>
  getUnreadSummary(): Promise<CustomerServiceUnreadSummary>
  uploadConversationImage(file: File): Promise<string>
}
