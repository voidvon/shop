import { ref } from 'vue'

import { cancelAfterSaleApplication, useAfterSaleRepository } from '@/entities/after-sale'
import { useTradeQuery } from '@/processes/trade/infrastructure/trade-query-provider'

export function useReturnDetailPageModel() {
  const afterSaleRepository = useAfterSaleRepository()
  const tradeQuery = useTradeQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const returnDetailPageData = ref<Awaited<ReturnType<typeof tradeQuery.getReturnDetailPageData>>>(null)

  async function loadReturnDetailPage(refundId: string) {
    if (!refundId) {
      returnDetailPageData.value = null
      return null
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await tradeQuery.getReturnDetailPageData(refundId)
      returnDetailPageData.value = data
      return data
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '退货详情加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function cancelReturnApplication(refundId: string) {
    return cancelAfterSaleApplication(afterSaleRepository, refundId)
  }

  return {
    cancelReturnApplication,
    errorMessage,
    isLoading,
    loadReturnDetailPage,
    returnDetailPageData,
  }
}
