import type {
  CustomerServiceConversationDetail,
  CustomerServiceConversationStatus,
  CustomerServiceConversationSummary,
  CustomerServiceMessage,
  CustomerServiceMessageSenderRole,
  CustomerServiceUnreadSummary,
} from '../../domain/customer-service'

export type BackendACustomerServiceRecord = Record<string, unknown>

function ensureArray<T>(input: unknown): T[] {
  return Array.isArray(input) ? input : []
}

function isRecord(value: unknown): value is BackendACustomerServiceRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeCollection(input: unknown, visited = new Set<unknown>()): BackendACustomerServiceRecord[] {
  if (visited.has(input)) {
    return []
  }

  if (Array.isArray(input)) {
    return input.filter(isRecord)
  }

  if (!isRecord(input)) {
    return []
  }

  visited.add(input)

  const candidateKeys = ['data', 'items', 'list', 'rows', 'records', 'messages', 'conversations']

  for (const key of candidateKeys) {
    const nextValue = input[key]

    if (Array.isArray(nextValue)) {
      return nextValue.filter(isRecord)
    }

    if (isRecord(nextValue)) {
      const nestedItems = normalizeCollection(nextValue, visited)

      if (nestedItems.length > 0) {
        return nestedItems
      }
    }
  }

  return []
}

function normalizeRecord(input: unknown): BackendACustomerServiceRecord | null {
  if (isRecord(input)) {
    const nestedData = input.data

    if (isRecord(nestedData)) {
      return nestedData
    }

    return input
  }

  return null
}

function pickRecordFromSources(
  sources: Array<BackendACustomerServiceRecord | null>,
  keys: string[],
) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (isRecord(value)) {
        return value
      }
    }
  }

  return null
}

function pickStringFromSources(
  sources: Array<BackendACustomerServiceRecord | null>,
  keys: string[],
) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value)
      }
    }
  }

  return null
}

function pickNumberFromSources(
  sources: Array<BackendACustomerServiceRecord | null>,
  keys: string[],
) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (typeof value === 'number' && Number.isFinite(value)) {
        return value
      }

      if (typeof value === 'string' && value.trim()) {
        const parsedValue = Number.parseFloat(value)

        if (Number.isFinite(parsedValue)) {
          return parsedValue
        }
      }
    }
  }

  return null
}

function resolveConversationStatus(rawStatus: string | null, rawStatusCode: number | null) {
  const normalizedStatus = rawStatus?.trim().toLowerCase() ?? null

  if (normalizedStatus) {
    if (['closed', 'done', 'resolved', 'finished', '已关闭', '关闭'].includes(normalizedStatus)) {
      return {
        status: 'closed' as CustomerServiceConversationStatus,
        statusLabel: '已关闭',
      }
    }

    if (['pending', 'waiting', 'todo', '待回复', '待处理'].includes(normalizedStatus)) {
      return {
        status: 'pending' as CustomerServiceConversationStatus,
        statusLabel: '待回复',
      }
    }

    if (['open', 'active', 'processing', 'replying', '服务中', '处理中'].includes(normalizedStatus)) {
      return {
        status: 'open' as CustomerServiceConversationStatus,
        statusLabel: '服务中',
      }
    }
  }

  if (rawStatusCode !== null) {
    if (rawStatusCode < 0) {
      return {
        status: 'closed' as CustomerServiceConversationStatus,
        statusLabel: '已关闭',
      }
    }

    if (rawStatusCode === 0) {
      return {
        status: 'pending' as CustomerServiceConversationStatus,
        statusLabel: '待回复',
      }
    }

    if (rawStatusCode === 1) {
      return {
        status: 'open' as CustomerServiceConversationStatus,
        statusLabel: '服务中',
      }
    }

    if (rawStatusCode === 2) {
      return {
        status: 'pending' as CustomerServiceConversationStatus,
        statusLabel: '待回复',
      }
    }
  }

  return {
    status: 'open' as CustomerServiceConversationStatus,
    statusLabel: '服务中',
  }
}

function resolveSenderRole(
  rawRole: string | null,
  rawDirection: string | null,
  rawIsAdmin: number | null,
) {
  const candidates = [rawRole, rawDirection]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase())

  if (rawIsAdmin !== null) {
    return rawIsAdmin > 0
      ? ('service' as CustomerServiceMessageSenderRole)
      : ('member' as CustomerServiceMessageSenderRole)
  }

  if (candidates.some((value) => ['customer_service', 'service', 'staff', 'admin'].includes(value))) {
    return 'service' as const
  }

  if (candidates.some((value) => ['system', 'notice'].includes(value))) {
    return 'system' as const
  }

  return 'member' as const
}

function buildConversationSources(record: BackendACustomerServiceRecord) {
  const lastMessage = pickRecordFromSources([record], ['last_message', 'lastMessage', 'latest_message', 'latestMessage'])

  return [record, lastMessage]
}

function buildMessageSources(record: BackendACustomerServiceRecord) {
  const sender = pickRecordFromSources([record], ['sender', 'user', 'member', 'customerService'])

  return [record, sender]
}

export function normalizeBackendACustomerServiceConversationCollection(input: unknown) {
  return normalizeCollection(input)
}

export function normalizeBackendACustomerServiceConversationRecord(input: unknown) {
  return normalizeRecord(input)
}

export function normalizeBackendACustomerServiceMessageCollection(input: unknown) {
  return normalizeCollection(input)
}

export function mapBackendACustomerServiceConversationSummary(
  record: BackendACustomerServiceRecord,
): CustomerServiceConversationSummary {
  const sources = buildConversationSources(record)
  const rawStatus = pickStringFromSources([record], ['status_name', 'statusName', 'status_text', 'statusText', 'status'])
  const rawStatusCode = pickNumberFromSources([record], ['status_code', 'statusCode', 'status'])
  const statusInfo = resolveConversationStatus(rawStatus, rawStatusCode)
  const previewText = pickStringFromSources(
    sources,
    ['preview', 'content', 'message', 'text', 'body'],
  )

  return {
    id: pickStringFromSources(sources, ['id', 'conversation_id', 'conversationId']) ?? '',
    lastMessageAt: pickStringFromSources(
      sources,
      ['last_message_at', 'lastMessageAt', 'updated_at', 'updatedAt', 'created_at', 'createdAt'],
    ),
    previewText: previewText ?? '暂无消息内容',
    sourceLabel: pickStringFromSources(sources, ['channel_name', 'channelName', 'source_label', 'sourceLabel']),
    status: statusInfo.status,
    statusLabel: pickStringFromSources(sources, ['status_name', 'statusName']) ?? statusInfo.statusLabel,
    subject: pickStringFromSources(sources, ['subject', 'title', 'name']) ?? '客服咨询',
    unreadCount: Math.max(0, pickNumberFromSources(sources, ['unread_count', 'unreadCount', 'unread']) ?? 0),
  }
}

export function mapBackendACustomerServiceConversationDetail(
  record: BackendACustomerServiceRecord,
): CustomerServiceConversationDetail {
  const summary = mapBackendACustomerServiceConversationSummary(record)
  const canReply = summary.status !== 'closed'

  return {
    ...summary,
    canReply,
    createdAt: pickStringFromSources([record], ['created_at', 'createdAt', 'last_message_at', 'lastMessageAt']),
  }
}

export function mapBackendACustomerServiceMessage(
  record: BackendACustomerServiceRecord,
): CustomerServiceMessage {
  const sources = buildMessageSources(record)
  const role = resolveSenderRole(
    pickStringFromSources(sources, ['sender_type', 'senderType', 'role']),
    pickStringFromSources(sources, ['direction', 'from_type', 'fromType']),
    pickNumberFromSources(sources, ['is_admin', 'isAdmin']),
  )

  return {
    content: pickStringFromSources(sources, ['content', 'message', 'text', 'body']) ?? '',
    id: pickStringFromSources(sources, ['id', 'message_id', 'messageId']) ?? '',
    senderName: pickStringFromSources(
      sources,
      ['sender_name', 'senderName', 'nickname', 'name', 'username'],
    ) ?? (role === 'service' ? '在线客服' : '我'),
    senderRole: role,
    sentAt: pickStringFromSources(sources, ['created_at', 'createdAt', 'sent_at', 'sentAt', 'updated_at', 'updatedAt']),
  }
}

export function mapBackendACustomerServiceUnreadSummary(
  input: unknown,
): CustomerServiceUnreadSummary {
  const record = normalizeRecord(input)

  if (!record) {
    return {
      conversationCount: 0,
      messageCount: 0,
    }
  }

  return {
    conversationCount: Math.max(
      0,
      pickNumberFromSources(
        [record],
        ['conversation_count', 'conversationCount', 'total', 'count'],
      ) ?? 0,
    ),
    messageCount: Math.max(
      0,
      pickNumberFromSources([record], ['message_count', 'messageCount', 'unread_count', 'unreadCount']) ?? 0,
    ),
  }
}

export function pickBackendACustomerServiceConversationId(input: unknown) {
  const record = normalizeRecord(input)

  if (!record) {
    return null
  }

  return pickStringFromSources([record], ['id', 'conversation_id', 'conversationId'])
}

export function sortCustomerServiceConversations<T extends CustomerServiceConversationSummary>(items: T[]) {
  return [...items].sort((left, right) => {
    const rightTime = right.lastMessageAt ? Date.parse(right.lastMessageAt) : 0
    const leftTime = left.lastMessageAt ? Date.parse(left.lastMessageAt) : 0
    return rightTime - leftTime
  })
}

export function sortCustomerServiceMessages(items: CustomerServiceMessage[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.sentAt ? Date.parse(left.sentAt) : 0
    const rightTime = right.sentAt ? Date.parse(right.sentAt) : 0

    if (leftTime === rightTime) {
      return left.id.localeCompare(right.id)
    }

    return leftTime - rightTime
  })
}

export function dedupeCustomerServiceMessages(items: CustomerServiceMessage[]) {
  const seenIds = new Set<string>()
  const dedupedItems: CustomerServiceMessage[] = []

  for (const item of items) {
    const dedupeKey = item.id || `${item.senderRole}:${item.sentAt ?? ''}:${item.content}`

    if (seenIds.has(dedupeKey)) {
      continue
    }

    seenIds.add(dedupeKey)
    dedupedItems.push(item)
  }

  return dedupedItems
}

export function normalizeBackendACustomerServiceMessagesFromConversation(
  record: BackendACustomerServiceRecord,
) {
  return ensureArray(record.messages).filter(isRecord).map(mapBackendACustomerServiceMessage)
}
