import { ref } from 'vue'

import { useTradeQuery, type OrderListPageData } from '@/processes/trade'

const emptyOrderListPageData: OrderListPageData = {
  keyword: '',
  orders: [],
}

export function useOrderListPageModel() {
  const tradeQuery = useTradeQuery()

  const orderListPageData = ref<OrderListPageData>(emptyOrderListPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadOrderListPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      orderListPageData.value = await tradeQuery.getOrderListPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '订单列表加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadOrderListPage,
    orderListPageData,
  }
}
