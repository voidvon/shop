import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useTradeStore } from '@/processes/trade'

function normalizeRouteKeyword(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0].trim() : ''
  }

  return typeof value === 'string' ? value.trim() : ''
}

export function useOrderSearchResultsPageModel() {
  const route = useRoute()
  const router = useRouter()
  const tradeStore = useTradeStore()

  const keyword = ref(normalizeRouteKeyword(route.query.keyword))
  const errorMessage = computed(() => tradeStore.errorMessage)
  const isLoading = computed(() => tradeStore.isLoadingOrderList)
  const orderListPageData = computed(() => tradeStore.orderListPageData)

  const results = computed(() => {
    const normalizedKeyword = keyword.value.trim().toLowerCase()

    if (!normalizedKeyword) {
      return []
    }

    return orderListPageData.value.orders.filter((order) => {
      return [order.orderNo, order.storeName, order.statusText, ...order.items.map((item) => item.productName)]
        .some((field) => field.toLowerCase().includes(normalizedKeyword))
    })
  })

  async function submitSearch(nextKeyword = keyword.value) {
    const normalizedKeyword = nextKeyword.trim()

    keyword.value = normalizedKeyword

    if (!normalizedKeyword) {
      await router.replace({ name: 'member-order-search-results' })
      return false
    }

    if (normalizedKeyword === normalizeRouteKeyword(route.query.keyword)) {
      return true
    }

    await router.replace({
      name: 'member-order-search-results',
      query: {
        keyword: normalizedKeyword,
      },
    })

    return true
  }

  function applyKeyword(nextKeyword: string) {
    keyword.value = nextKeyword.trim()
  }

  async function loadOrderListPage() {
    await tradeStore.loadOrderList()
  }

  async function cancelOrder(orderId: string) {
    return tradeStore.cancelOrder(orderId)
  }

  async function payOrder(orderId: string) {
    return tradeStore.payOrderById(orderId)
  }

  async function confirmReceipt(orderId: string) {
    return tradeStore.confirmReceipt(orderId)
  }

  async function applyOrderRefund(orderId: string, reason: string) {
    return tradeStore.applyOrderRefund(orderId, reason)
  }

  watch(
    () => route.query.keyword,
    (value) => {
      keyword.value = normalizeRouteKeyword(value)
    },
    { immediate: true },
  )

  return {
    applyKeyword,
    applyOrderRefund,
    cancelOrder,
    confirmReceipt,
    errorMessage,
    isLoading,
    keyword,
    loadOrderListPage,
    payOrder,
    results,
    submitSearch,
  }
}
