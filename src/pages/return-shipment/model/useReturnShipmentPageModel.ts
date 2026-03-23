import { ref } from 'vue'

import {
  saveAfterSaleReturnShipment,
  useAfterSaleRepository,
} from '@/entities/after-sale'
import { useTradeQuery } from '@/processes/trade/infrastructure/trade-query-provider'

export function useReturnShipmentPageModel() {
  const afterSaleRepository = useAfterSaleRepository()
  const tradeQuery = useTradeQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const returnDetailPageData = ref<Awaited<ReturnType<typeof tradeQuery.getReturnDetailPageData>>>(null)

  async function loadReturnShipmentPage(refundId: string) {
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
      errorMessage.value = error instanceof Error ? error.message : '退货物流信息加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function readShipmentDraft(refundId: string) {
    return afterSaleRepository.getReturnShipment(refundId)
  }

  function submitShipment(
    refundId: string,
    payload: {
      company: string
      shippedAt: string
      trackingNo: string
    },
  ) {
    return saveAfterSaleReturnShipment(afterSaleRepository, {
      ...payload,
      refundId,
    })
  }

  return {
    errorMessage,
    isLoading,
    loadReturnShipmentPage,
    readShipmentDraft,
    returnDetailPageData,
    submitShipment,
  }
}
