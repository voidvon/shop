import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import { resolveBackendAMediaUrl } from '@/shared/api/backend-a/backend-a-config'

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

type BackendAUploadRecord = Record<string, unknown>

function isRecord(value: unknown): value is BackendAUploadRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeCandidateString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()
  return normalizedValue ? normalizedValue : null
}

function findNestedUploadValue(
  input: unknown,
  predicate: (key: string, value: string) => boolean,
  depth = 0,
): string | null {
  if (depth > 4 || input === null || input === undefined) {
    return null
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const matchedValue = findNestedUploadValue(item, predicate, depth + 1)

      if (matchedValue) {
        return matchedValue
      }
    }

    return null
  }

  if (!isRecord(input)) {
    return null
  }

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const value = normalizeCandidateString(rawValue)

    if (value && predicate(rawKey.toLowerCase(), value)) {
      return value
    }
  }

  for (const rawValue of Object.values(input)) {
    const matchedValue = findNestedUploadValue(rawValue, predicate, depth + 1)

    if (matchedValue) {
      return matchedValue
    }
  }

  return null
}

function resolveUploadedImageUrl(input: unknown) {
  const uploadUrl = findNestedUploadValue(input, (key, value) => {
    if (key.includes('url')) {
      return true
    }

    if (key.includes('path')) {
      return value.includes('/') || value.startsWith('uploads/')
    }

    if (key.includes('image')) {
      return true
    }

    return false
  })

  if (!uploadUrl) {
    return null
  }

  return resolveBackendAMediaUrl(uploadUrl) ?? uploadUrl
}

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

    async uploadConversationImage(file) {
      const formData = new FormData()
      formData.append('image', file)

      const response = await httpClient.post<unknown>('/api/v1/uploads/images', formData)
      const uploadedImageUrl = resolveUploadedImageUrl(response)

      if (!uploadedImageUrl) {
        throw new Error('图片上传成功，但未返回图片地址')
      }

      return uploadedImageUrl
    },
  }
}
