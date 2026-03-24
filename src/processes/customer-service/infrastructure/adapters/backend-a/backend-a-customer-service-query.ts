import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'

import type { MemberAuthSession } from '@/entities/member-auth'

import type { CustomerServiceQuery } from '../../../domain/customer-service-query'
import {
  dedupeCustomerServiceMessages,
  mapBackendACustomerServiceConversationDetail,
  mapBackendACustomerServiceConversationSummary,
  mapBackendACustomerServiceMessage,
  mapBackendACustomerServiceUnreadSummary,
  normalizeBackendACustomerServiceConversationCollection,
  normalizeBackendACustomerServiceConversationRecord,
  normalizeBackendACustomerServiceMessageCollection,
  normalizeBackendACustomerServiceMessagesFromConversation,
  pickBackendACustomerServiceConversationId,
  sortCustomerServiceConversations,
  sortCustomerServiceMessages,
} from '../../mappers/backend-a-customer-service-mapper'

function createBackendACustomerServiceHttpClient(memberAuthSession: MemberAuthSession) {
  return createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })
}

export function createBackendACustomerServiceQuery(
  memberAuthSession: MemberAuthSession,
): CustomerServiceQuery {
  const httpClient = createBackendACustomerServiceHttpClient(memberAuthSession)

  async function fetchConversationList(perPage = 20) {
    const response = await httpClient.get<unknown>(
      '/api/v1/customer-service/conversations',
      { per_page: perPage },
    )

    return sortCustomerServiceConversations(
      normalizeBackendACustomerServiceConversationCollection(response)
        .map(mapBackendACustomerServiceConversationSummary)
        .filter((item) => item.id),
    )
  }

  async function resolveLatestConversationId() {
    const conversations = await fetchConversationList(1)
    return conversations[0]?.id ?? null
  }

  return {
    async appendConversationMessage(command) {
      await httpClient.post<unknown>(
        `/api/v1/customer-service/conversations/${encodeURIComponent(command.conversationId)}/messages`,
        {
          content: command.content.trim(),
        },
      )
    },

    async createConversation(command) {
      const response = await httpClient.post<unknown>(
        '/api/v1/customer-service/conversations',
        {
          content: command.content.trim(),
          subject: command.subject?.trim() || undefined,
        },
      )

      const conversationId = pickBackendACustomerServiceConversationId(response)
        ?? await resolveLatestConversationId()

      if (!conversationId) {
        throw new Error('客服会话创建成功，但未返回会话标识')
      }

      return conversationId
    },

    async getConversationDetail(conversationId) {
      const response = await httpClient.get<unknown>(
        `/api/v1/customer-service/conversations/${encodeURIComponent(conversationId)}`,
      )
      const record = normalizeBackendACustomerServiceConversationRecord(response)

      return record ? mapBackendACustomerServiceConversationDetail(record) : null
    },

    async getConversationIncrement(query) {
      const afterMessageId = Number.parseInt(query.afterMessageId ?? '', 10)
      const response = await httpClient.get<unknown>(
        `/api/v1/customer-service/conversations/${encodeURIComponent(query.conversationId)}/increment`,
        {
          after_id: Number.isFinite(afterMessageId) ? afterMessageId : 0,
          limit: query.limit ?? 50,
        },
      )

      return sortCustomerServiceMessages(
        dedupeCustomerServiceMessages(
          normalizeBackendACustomerServiceMessageCollection(response).map(mapBackendACustomerServiceMessage),
        ),
      )
    },

    async getConversationList(query) {
      return fetchConversationList(query?.perPage ?? 20)
    },

    async getConversationMessages(conversationId, query) {
      const response = await httpClient.get<unknown>(
        `/api/v1/customer-service/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          per_page: query?.perPage ?? 50,
        },
      )
      const conversationRecord = normalizeBackendACustomerServiceConversationRecord(response)
      const directMessages = normalizeBackendACustomerServiceMessageCollection(response).map(mapBackendACustomerServiceMessage)
      const embeddedMessages = conversationRecord
        ? normalizeBackendACustomerServiceMessagesFromConversation(conversationRecord)
        : []

      return sortCustomerServiceMessages(
        dedupeCustomerServiceMessages([...embeddedMessages, ...directMessages]),
      )
    },

    async getUnreadSummary() {
      const response = await httpClient.get<unknown>('/api/v1/customer-service/unread-summary')
      return mapBackendACustomerServiceUnreadSummary(response)
    },
  }
}
