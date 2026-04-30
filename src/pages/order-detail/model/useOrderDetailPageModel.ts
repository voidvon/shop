import { computed, ref } from 'vue'

import { useTradeStore } from '@/processes/trade'
import { useTradeQuery } from '@/processes/trade/infrastructure/trade-query-provider'

export function useOrderDetailPageModel() {
  const tradeQuery = useTradeQuery()
  const tradeStore = useTradeStore()

  const orderDetailPageData = ref<Awaited<ReturnType<typeof tradeQuery.getOrderDetailPageData>>>(null)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  const orderListErrorMessage = computed(() => tradeStore.errorMessage)

  async function loadOrderDetailPage(orderId: string) {
    if (!orderId) {
      orderDetailPageData.value = null
      return null
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await tradeQuery.getOrderDetailPageData(orderId)
      orderDetailPageData.value = data
      return data
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '订单详情加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function cancelOrder(orderId: string) {
    await tradeStore.loadOrderList()
    await tradeStore.cancelOrder(orderId)
    await loadOrderDetailPage(orderId)
  }

  async function payOrder(orderId: string) {
    await tradeStore.loadOrderList()
    await tradeStore.payOrderById(orderId)
    await loadOrderDetailPage(orderId)
  }

  async function confirmReceipt(orderId: string) {
    await tradeStore.loadOrderList()
    await tradeStore.confirmReceipt(orderId)
    await loadOrderDetailPage(orderId)
  }

  async function applyOrderRefund(orderId: string, reason: string) {
    await tradeStore.loadOrderList()
    await tradeStore.applyOrderRefund(orderId, reason)
    await loadOrderDetailPage(orderId)
  }

  return {
    applyOrderRefund,
    cancelOrder,
    confirmReceipt,
    errorMessage,
    isLoading,
    loadOrderDetailPage,
    orderDetailPageData,
    orderListErrorMessage,
    payOrder,
  }
}
