import { computed, ref } from 'vue'

import {
  useCustomerServiceQuery,
  type CreateCustomerServiceConversationCommand,
  type CustomerServiceConversationSummary,
  type CustomerServiceUnreadSummary,
} from '@/processes/customer-service'

const emptyUnreadSummary: CustomerServiceUnreadSummary = {
  conversationCount: 0,
  messageCount: 0,
}

export function useCustomerServiceConversationListPageModel() {
  const customerServiceQuery = useCustomerServiceQuery()

  const conversations = ref<CustomerServiceConversationSummary[]>([])
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const unreadSummary = ref<CustomerServiceUnreadSummary>(emptyUnreadSummary)

  const hasConversations = computed(() => conversations.value.length > 0)

  async function loadConversationListPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      const [nextConversations, nextUnreadSummary] = await Promise.all([
        customerServiceQuery.getConversationList({ perPage: 50 }),
        customerServiceQuery.getUnreadSummary(),
      ])

      conversations.value = nextConversations
      unreadSummary.value = nextUnreadSummary
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '客服会话加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createConversation(command: CreateCustomerServiceConversationCommand) {
    isSubmitting.value = true
    errorMessage.value = null

    try {
      const conversationId = await customerServiceQuery.createConversation(command)
      await loadConversationListPage()
      return conversationId
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '客服会话创建失败'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    conversations,
    createConversation,
    errorMessage,
    hasConversations,
    isLoading,
    isSubmitting,
    loadConversationListPage,
    unreadSummary,
  }
}
