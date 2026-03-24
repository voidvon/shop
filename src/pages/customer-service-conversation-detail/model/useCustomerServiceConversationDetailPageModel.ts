import { computed, ref } from 'vue'

import {
  useCustomerServiceQuery,
  type CustomerServiceConversationDetail,
  type CustomerServiceMessage,
} from '@/processes/customer-service'

const emptyConversationMessages: CustomerServiceMessage[] = []

function dedupeMessages(messages: CustomerServiceMessage[]) {
  const seenIds = new Set<string>()
  const nextMessages: CustomerServiceMessage[] = []

  for (const message of messages) {
    const dedupeKey = message.id || `${message.senderRole}:${message.sentAt ?? ''}:${message.content}`

    if (seenIds.has(dedupeKey)) {
      continue
    }

    seenIds.add(dedupeKey)
    nextMessages.push(message)
  }

  return nextMessages
}

function sortMessages(messages: CustomerServiceMessage[]) {
  return [...messages].sort((left, right) => {
    const leftTime = left.sentAt ? Date.parse(left.sentAt) : 0
    const rightTime = right.sentAt ? Date.parse(right.sentAt) : 0

    if (leftTime === rightTime) {
      return left.id.localeCompare(right.id)
    }

    return leftTime - rightTime
  })
}

export function useCustomerServiceConversationDetailPageModel() {
  const customerServiceQuery = useCustomerServiceQuery()

  const conversation = ref<CustomerServiceConversationDetail | null>(null)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const isSending = ref(false)
  const messages = ref<CustomerServiceMessage[]>(emptyConversationMessages)

  const hasMessages = computed(() => messages.value.length > 0)
  const latestMessageId = computed(() => messages.value[messages.value.length - 1]?.id ?? null)

  async function loadConversationDetailPage(conversationId: string) {
    isLoading.value = true
    errorMessage.value = null

    try {
      const [nextConversation, nextMessages] = await Promise.all([
        customerServiceQuery.getConversationDetail(conversationId),
        customerServiceQuery.getConversationMessages(conversationId, { perPage: 100 }),
      ])

      conversation.value = nextConversation
      messages.value = sortMessages(dedupeMessages(nextMessages))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '客服会话详情加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function appendMessage(conversationId: string, content: string) {
    isSending.value = true
    errorMessage.value = null

    try {
      await customerServiceQuery.appendConversationMessage({
        content,
        conversationId,
      })

      await loadConversationDetailPage(conversationId)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '发送留言失败'
      throw error
    } finally {
      isSending.value = false
    }
  }

  async function syncConversationIncrement(conversationId: string) {
    try {
      const nextMessages = await customerServiceQuery.getConversationIncrement({
        afterMessageId: latestMessageId.value,
        conversationId,
        limit: 50,
      })

      if (nextMessages.length === 0) {
        return
      }

      messages.value = sortMessages(dedupeMessages([...messages.value, ...nextMessages]))

      const nextConversation = await customerServiceQuery.getConversationDetail(conversationId)

      if (nextConversation) {
        conversation.value = nextConversation
      }
    } catch {
      // Ignore polling errors to avoid interrupting the chat page.
    }
  }

  return {
    appendMessage,
    conversation,
    errorMessage,
    hasMessages,
    isLoading,
    isSending,
    loadConversationDetailPage,
    messages,
    syncConversationIncrement,
  }
}
