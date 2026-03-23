import { computed, ref } from 'vue'

import {
  submitAfterSaleApplication,
  type AfterSaleApplicationType,
  useAfterSaleRepository,
} from '@/entities/after-sale'
import { useTradeQuery } from '@/processes/trade/infrastructure/trade-query-provider'

export function useAfterSaleApplyPageModel() {
  const afterSaleRepository = useAfterSaleRepository()
  const tradeQuery = useTradeQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const orderDetailPageData = ref<Awaited<ReturnType<typeof tradeQuery.getOrderDetailPageData>>>(null)

  const currentItem = computed(() => {
    return (orderItemId: string) =>
      orderDetailPageData.value?.items.find((item) => item.orderItemId === orderItemId) ?? null
  })

  async function loadAfterSaleApplyPage(orderId: string) {
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
      errorMessage.value = error instanceof Error ? error.message : '售后申请数据加载失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function submitApplication(input: {
    description: string
    orderId: string
    orderItemId: string
    paymentMethod: string
    quantity: number
    reason: string
    type: AfterSaleApplicationType
  }) {
    const item = currentItem.value(input.orderItemId)
    const orderDetail = orderDetailPageData.value

    if (!item || !orderDetail) {
      throw new Error('订单商品不存在')
    }

    const applyQuantity = Math.max(1, Math.min(input.quantity, item.quantity))

    return submitAfterSaleApplication(afterSaleRepository, {
      applyQuantity,
      description: input.description,
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      paymentMethod: input.paymentMethod,
      productId: item.productId,
      productImageUrl: item.productImageUrl,
      productName: item.productName,
      quantity: item.quantity,
      reason: input.reason,
      refundAmount: item.unitPrice * applyQuantity,
      skuDescription: item.skuDescription,
      storeId: item.storeId,
      storeName: orderDetail.storeName,
      type: input.type,
      unitPrice: item.unitPrice,
    })
  }

  return {
    currentItem,
    errorMessage,
    isLoading,
    loadAfterSaleApplyPage,
    orderDetailPageData,
    submitAfterSaleApplication: submitApplication,
  }
}
