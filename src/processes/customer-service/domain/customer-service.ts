export type CustomerServiceConversationStatus = 'closed' | 'open' | 'pending'
export type CustomerServiceMessageSenderRole = 'member' | 'service' | 'system'

export interface CustomerServiceUnreadSummary {
  conversationCount: number
  messageCount: number
}

export interface CustomerServiceConversationSummary {
  id: string
  lastMessageAt: string | null
  previewText: string
  sourceLabel: string | null
  status: CustomerServiceConversationStatus
  statusLabel: string
  subject: string
  unreadCount: number
}

export interface CustomerServiceConversationDetail extends CustomerServiceConversationSummary {
  canReply: boolean
  createdAt: string | null
}

export interface CustomerServiceMessage {
  content: string
  id: string
  senderName: string
  senderRole: CustomerServiceMessageSenderRole
  sentAt: string | null
}

export interface CreateCustomerServiceConversationCommand {
  content: string
  subject?: string
}

export interface AppendCustomerServiceMessageCommand {
  content: string
  conversationId: string
}

export interface CustomerServiceMessageIncrementQuery {
  afterMessageId?: string | null
  conversationId: string
  limit?: number
}
