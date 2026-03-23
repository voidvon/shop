import { ref } from 'vue'

import { useTradeQuery } from '@/processes/trade/infrastructure/trade-query-provider'

export function useAfterSaleListPageModel() {
  const tradeQuery = useTradeQuery()

  const afterSaleListPageData = ref<Awaited<ReturnType<typeof tradeQuery.getAfterSaleListPageData>> | null>(null)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadAfterSaleListPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await tradeQuery.getAfterSaleListPageData()
      afterSaleListPageData.value = data
      return data
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '售后列表加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    afterSaleListPageData,
    errorMessage,
    isLoading,
    loadAfterSaleListPage,
  }
}
