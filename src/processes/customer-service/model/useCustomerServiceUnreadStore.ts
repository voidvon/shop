import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useMemberAuthSession } from '@/entities/member-auth'

import type { CustomerServiceUnreadSummary } from '../domain/customer-service'
import { useCustomerServiceQuery } from '../infrastructure/customer-service-query-provider'

const emptyUnreadSummary: CustomerServiceUnreadSummary = {
  conversationCount: 0,
  messageCount: 0,
}

const CUSTOMER_SERVICE_UNREAD_POLLING_INTERVAL_MS = 30000

export const useCustomerServiceUnreadStore = defineStore('customer-service-unread', () => {
  const memberAuthSession = useMemberAuthSession()
  const customerServiceQuery = useCustomerServiceQuery()

  const currentScopeKey = ref(resolveCustomerServiceUnreadScopeKey(
    memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? null,
  ))
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const isPolling = ref(false)
  const unreadSummary = ref<CustomerServiceUnreadSummary>({ ...emptyUnreadSummary })

  let pollingTimer: ReturnType<typeof setInterval> | null = null
  let pendingRefreshPromise: Promise<CustomerServiceUnreadSummary> | null = null

  const hasUnreadMessages = computed(() => unreadSummary.value.messageCount > 0)
  const totalUnreadCount = computed(() => unreadSummary.value.messageCount)

  function resetUnreadSummary() {
    unreadSummary.value = { ...emptyUnreadSummary }
    errorMessage.value = null
    hasLoaded.value = false
    isLoading.value = false
  }

  function isAuthenticated() {
    return Boolean(memberAuthSession.getSnapshot().authResult?.userInfo.userId)
  }

  function clearPollingTimer() {
    if (!pollingTimer) {
      return
    }

    clearInterval(pollingTimer)
    pollingTimer = null
  }

  async function refreshUnreadSummary(options?: { silent?: boolean }) {
    if (!isAuthenticated()) {
      resetUnreadSummary()
      hasLoaded.value = true
      return unreadSummary.value
    }

    if (pendingRefreshPromise) {
      return pendingRefreshPromise
    }

    const isSilent = options?.silent === true

    if (!isSilent) {
      isLoading.value = true
    }

    errorMessage.value = null

    pendingRefreshPromise = customerServiceQuery
      .getUnreadSummary()
      .then((nextUnreadSummary) => {
        unreadSummary.value = nextUnreadSummary
        hasLoaded.value = true
        return nextUnreadSummary
      })
      .catch((error: unknown) => {
        errorMessage.value = error instanceof Error ? error.message : '客服未读状态加载失败'
        throw error
      })
      .finally(() => {
        pendingRefreshPromise = null

        if (!isSilent) {
          isLoading.value = false
        }
      })

    return pendingRefreshPromise
  }

  function startPolling() {
    isPolling.value = true

    if (!isAuthenticated()) {
      clearPollingTimer()
      resetUnreadSummary()
      hasLoaded.value = true
      return
    }

    clearPollingTimer()
    void refreshUnreadSummary({ silent: hasLoaded.value })

    pollingTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return
      }

      void refreshUnreadSummary({ silent: true })
    }, CUSTOMER_SERVICE_UNREAD_POLLING_INTERVAL_MS)
  }

  function stopPolling() {
    isPolling.value = false
    clearPollingTimer()
  }

  memberAuthSession.subscribe((snapshot) => {
    const nextScopeKey = resolveCustomerServiceUnreadScopeKey(snapshot.authResult?.userInfo.userId ?? null)

    if (nextScopeKey === currentScopeKey.value) {
      return
    }

    currentScopeKey.value = nextScopeKey
    resetUnreadSummary()

    if (!snapshot.authResult?.userInfo.userId) {
      hasLoaded.value = true
      clearPollingTimer()
      return
    }

    if (isPolling.value) {
      startPolling()
      return
    }

    void refreshUnreadSummary({ silent: true })
  })

  return {
    currentScopeKey,
    errorMessage,
    hasLoaded,
    hasUnreadMessages,
    isLoading,
    isPolling,
    refreshUnreadSummary,
    startPolling,
    stopPolling,
    totalUnreadCount,
    unreadSummary,
  }
})

function resolveCustomerServiceUnreadScopeKey(userId: string | null) {
  return userId ?? 'guest'
}
