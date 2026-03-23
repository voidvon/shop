import { ref } from 'vue'

import { cancelAfterSaleApplication, useAfterSaleRepository } from '@/entities/after-sale'
import { useTradeQuery } from '@/processes/trade/infrastructure/trade-query-provider'

export function useRefundDetailPageModel() {
  const afterSaleRepository = useAfterSaleRepository()
  const tradeQuery = useTradeQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const refundDetailPageData = ref<Awaited<ReturnType<typeof tradeQuery.getRefundDetailPageData>>>(null)

  async function loadRefundDetailPage(refundId: string) {
    if (!refundId) {
      refundDetailPageData.value = null
      return null
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await tradeQuery.getRefundDetailPageData(refundId)
      refundDetailPageData.value = data
      return data
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '退款详情加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function cancelRefundApplication(refundId: string) {
    return cancelAfterSaleApplication(afterSaleRepository, refundId)
  }

  return {
    cancelRefundApplication,
    errorMessage,
    isLoading,
    loadRefundDetailPage,
    refundDetailPageData,
  }
}
