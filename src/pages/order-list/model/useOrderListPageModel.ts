import { computed } from 'vue'

import { useTradeStore } from '@/processes/trade'

export function useOrderListPageModel() {
  const tradeStore = useTradeStore()

  const orderListPageData = computed(() => tradeStore.orderListPageData)
  const errorMessage = computed(() => tradeStore.errorMessage)
  const isLoading = computed(() => tradeStore.isLoadingOrderList)

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

  return {
    cancelOrder,
    confirmReceipt,
    errorMessage,
    isLoading,
    loadOrderListPage,
    orderListPageData,
    payOrder,
  }
}
