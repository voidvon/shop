import type { MemberAuthSession } from '@/entities/member-auth'

import type {
  CustomerServiceConversationDetail,
  CustomerServiceConversationSummary,
  CustomerServiceMessage,
  CustomerServiceUnreadSummary,
} from '../../../domain/customer-service'
import type { CustomerServiceQuery } from '../../../domain/customer-service-query'

interface StoredCustomerServiceConversation {
  createdAt: string
  id: string
  messages: CustomerServiceMessage[]
  sourceLabel: string | null
  status: CustomerServiceConversationDetail['status']
  statusLabel: string
  subject: string
  unreadCount: number
  updatedAt: string
}

const customerServiceStoragePrefix = 'shop.customer-service'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createStorageKey(scopeKey: string) {
  return `${customerServiceStoragePrefix}.${scopeKey}`
}

function createSystemReply(messageIdSeed: string, sentAt: string) {
  return {
    content: '已收到你的留言，我们会尽快安排客服跟进处理。',
    id: `${messageIdSeed}-service`,
    senderName: '在线客服',
    senderRole: 'service' as const,
    sentAt,
  }
}

function toConversationSummary(
  conversation: StoredCustomerServiceConversation,
): CustomerServiceConversationSummary {
  const lastMessage = conversation.messages[conversation.messages.length - 1] ?? null

  return {
    id: conversation.id,
    lastMessageAt: lastMessage?.sentAt ?? conversation.updatedAt,
    previewText: lastMessage?.content ?? '暂无消息内容',
    sourceLabel: conversation.sourceLabel,
    status: conversation.status,
    statusLabel: conversation.statusLabel,
    subject: conversation.subject,
    unreadCount: conversation.unreadCount,
  }
}

function toConversationDetail(
  conversation: StoredCustomerServiceConversation,
): CustomerServiceConversationDetail {
  const summary = toConversationSummary(conversation)

  return {
    ...summary,
    canReply: summary.status !== 'closed',
    createdAt: conversation.createdAt,
  }
}

function resolveScopeKey(memberAuthSession: MemberAuthSession) {
  return memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest'
}

function readStoredConversations(scopeKey: string): StoredCustomerServiceConversation[] {
  if (!canUseStorage()) {
    return []
  }

  const rawValue = window.localStorage.getItem(createStorageKey(scopeKey))

  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as StoredCustomerServiceConversation[]
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    window.localStorage.removeItem(createStorageKey(scopeKey))
    return []
  }
}

function writeStoredConversations(
  scopeKey: string,
  conversations: StoredCustomerServiceConversation[],
) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(createStorageKey(scopeKey), JSON.stringify(conversations))
}

function sortConversations(conversations: StoredCustomerServiceConversation[]) {
  return [...conversations].sort((left, right) => (
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  ))
}

function buildUnreadSummary(conversations: StoredCustomerServiceConversation[]): CustomerServiceUnreadSummary {
  return conversations.reduce<CustomerServiceUnreadSummary>((summary, conversation) => {
    if (conversation.unreadCount > 0) {
      summary.conversationCount += 1
      summary.messageCount += conversation.unreadCount
    }

    return summary
  }, {
    conversationCount: 0,
    messageCount: 0,
  })
}

function readConversationList(scopeKey: string) {
  return sortConversations(readStoredConversations(scopeKey))
}

function updateConversation(
  scopeKey: string,
  conversationId: string,
  updater: (conversation: StoredCustomerServiceConversation) => StoredCustomerServiceConversation,
) {
  const conversations = readStoredConversations(scopeKey)
  const nextConversations = conversations.map((conversation) => (
    conversation.id === conversationId ? updater(conversation) : conversation
  ))
  writeStoredConversations(scopeKey, nextConversations)
  return nextConversations.find((conversation) => conversation.id === conversationId) ?? null
}

export function createMockCustomerServiceQuery(
  memberAuthSession: MemberAuthSession,
): CustomerServiceQuery {
  function getScopeKey() {
    return resolveScopeKey(memberAuthSession)
  }

  return {
    async appendConversationMessage(command) {
      const scopeKey = getScopeKey()
      const now = new Date().toISOString()
      const memberMessageId = `${Date.now()}`
      const serviceReplyId = `${Date.now() + 1}`

      const updatedConversation = updateConversation(scopeKey, command.conversationId, (conversation) => ({
        ...conversation,
        messages: [
          ...conversation.messages,
          {
            content: command.content.trim(),
            id: memberMessageId,
            senderName: '我',
            senderRole: 'member',
            sentAt: now,
          },
          createSystemReply(serviceReplyId, now),
        ],
        status: 'open',
        statusLabel: '服务中',
        unreadCount: conversation.unreadCount + 1,
        updatedAt: now,
      }))

      if (!updatedConversation) {
        throw new Error('客服会话不存在')
      }
    },

    async createConversation(command) {
      const scopeKey = getScopeKey()
      const now = new Date().toISOString()
      const conversationId = `${Date.now()}`
      const firstMessageId = `${Date.now()}-1`
      const serviceReplyId = `${Date.now()}-2`
      const nextConversation: StoredCustomerServiceConversation = {
        createdAt: now,
        id: conversationId,
        messages: [
          {
            content: command.content.trim(),
            id: firstMessageId,
            senderName: '我',
            senderRole: 'member',
            sentAt: now,
          },
          createSystemReply(serviceReplyId, now),
        ],
        sourceLabel: '在线客服',
        status: 'open',
        statusLabel: '服务中',
        subject: command.subject?.trim() || '客服咨询',
        unreadCount: 1,
        updatedAt: now,
      }

      writeStoredConversations(scopeKey, [
        nextConversation,
        ...readStoredConversations(scopeKey),
      ])

      return conversationId
    },

    async getConversationDetail(conversationId) {
      const scopeKey = getScopeKey()
      const detailConversation = updateConversation(scopeKey, conversationId, (conversation) => ({
        ...conversation,
        unreadCount: 0,
      }))

      return detailConversation ? toConversationDetail(detailConversation) : null
    },

    async getConversationIncrement(query) {
      const scopeKey = getScopeKey()
      const targetConversation = readStoredConversations(scopeKey)
        .find((conversation) => conversation.id === query.conversationId)

      if (!targetConversation) {
        return []
      }

      const afterMessageId = query.afterMessageId
      const startIndex = afterMessageId
        ? targetConversation.messages.findIndex((message) => message.id === afterMessageId) + 1
        : 0

      return targetConversation.messages.slice(
        Math.max(startIndex, 0),
        Math.max(startIndex, 0) + (query.limit ?? 50),
      )
    },

    async getConversationList(query) {
      const scopeKey = getScopeKey()
      return readConversationList(scopeKey)
        .slice(0, query?.perPage ?? 20)
        .map(toConversationSummary)
    },

    async getConversationMessages(conversationId) {
      const scopeKey = getScopeKey()
      const detailConversation = updateConversation(scopeKey, conversationId, (conversation) => ({
        ...conversation,
        unreadCount: 0,
      }))

      return detailConversation?.messages ?? []
    },

    async getUnreadSummary() {
      return buildUnreadSummary(readStoredConversations(getScopeKey()))
    },

    async uploadConversationImage(file) {
      if (typeof FileReader === 'undefined') {
        throw new Error('当前环境不支持图片读取')
      }

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          if (typeof reader.result === 'string' && reader.result) {
            resolve(reader.result)
            return
          }

          reject(new Error('图片读取失败'))
        }

        reader.onerror = () => {
          reject(new Error('图片读取失败'))
        }

        reader.readAsDataURL(file)
      })
    },
  }
}
