import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useMemberAuthSession } from '@/entities/member-auth'
import {
  cancelOrder as cancelMemberOrder,
  confirmOrderReceipt,
  payOrder,
  useOrderRepository,
  type CheckoutPreview,
  type OrderConfirmation,
} from '@/entities/order'

import { useTradeQuery } from '../infrastructure/trade-query-provider'
import type { OrderListPageData } from '../domain/trade-page-data'

type OrderSummary = {
  pendingPaymentCount: number
  pendingReceiptCount: number
  pendingReviewCount: number
  pendingShipmentCount: number
  refundAndReturnCount: number
}

const emptyOrderListPageData: OrderListPageData = {
  keyword: '',
  orders: [],
}

const emptyOrderSummary: OrderSummary = {
  pendingPaymentCount: 0,
  pendingReceiptCount: 0,
  pendingReviewCount: 0,
  pendingShipmentCount: 0,
  refundAndReturnCount: 0,
}

function createOrderSummary(orders: OrderListPageData['orders']): OrderSummary {
  return orders.reduce<OrderSummary>((summary, order) => {
    switch (order.status) {
      case 'pending-payment':
        summary.pendingPaymentCount += 1
        break
      case 'pending-shipment':
        summary.pendingShipmentCount += 1
        break
      case 'pending-receipt':
        summary.pendingReceiptCount += 1
        break
      case 'pending-review':
        summary.pendingReviewCount += 1
        break
      case 'refunding':
      case 'returning':
        summary.refundAndReturnCount += 1
        break
      default:
        break
    }

    return summary
  }, { ...emptyOrderSummary })
}

export const useTradeStore = defineStore('trade', () => {
  const memberAuthSession = useMemberAuthSession()
  const orderRepository = useOrderRepository()
  const tradeQuery = useTradeQuery()

  const currentScopeKey = ref(resolveTradeScopeKey(memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? null))
  const errorMessage = ref<string | null>(null)
  const hasLoadedOrderList = ref(false)
  const isLoadingOrderList = ref(false)
  const isOrderListStale = ref(false)
  const orderListPageData = ref<OrderListPageData>(emptyOrderListPageData)

  const orderSummary = computed(() => createOrderSummary(orderListPageData.value.orders))

  async function loadOrderList(options?: { force?: boolean }) {
    if (hasLoadedOrderList.value && !isOrderListStale.value && !options?.force) {
      return orderListPageData.value
    }

    isLoadingOrderList.value = true
    errorMessage.value = null

    try {
      orderListPageData.value = await tradeQuery.getOrderListPageData()
      hasLoadedOrderList.value = true
      isOrderListStale.value = false
      return orderListPageData.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '订单列表加载失败'
      throw error
    } finally {
      isLoadingOrderList.value = false
    }
  }

  async function recordSubmittedOrder(_confirmation: OrderConfirmation, _preview: CheckoutPreview) {
    await loadOrderList({ force: true })
  }

  function markOrderListStale() {
    isOrderListStale.value = true
  }

  async function cancelOrder(orderId: string) {
    const targetOrder = orderListPageData.value.orders.find((order) => order.orderId === orderId)

    if (!targetOrder) {
      throw new Error('订单不存在')
    }

    const update = await cancelMemberOrder(orderRepository, {
      currentStatus: targetOrder.status,
      orderId,
    })

    await loadOrderList({ force: true })
    return update
  }

  async function payOrderById(orderId: string) {
    const targetOrder = orderListPageData.value.orders.find((order) => order.orderId === orderId)

    if (!targetOrder) {
      throw new Error('订单不存在')
    }

    const update = await payOrder(orderRepository, {
      currentStatus: targetOrder.status,
      orderId,
    })

    await loadOrderList({ force: true })
    return update
  }

  async function confirmReceipt(orderId: string) {
    const targetOrder = orderListPageData.value.orders.find((order) => order.orderId === orderId)

    if (!targetOrder) {
      throw new Error('订单不存在')
    }

    const update = await confirmOrderReceipt(orderRepository, {
      currentStatus: targetOrder.status,
      orderId,
    })

    await loadOrderList({ force: true })
    return update
  }

  function resetForScope(scopeKey: string) {
    currentScopeKey.value = scopeKey
    orderListPageData.value = emptyOrderListPageData
    errorMessage.value = null
    hasLoadedOrderList.value = false
    isLoadingOrderList.value = false
    isOrderListStale.value = true
  }

  memberAuthSession.subscribe((snapshot) => {
    const nextScopeKey = resolveTradeScopeKey(snapshot.authResult?.userInfo.userId ?? null)

    if (nextScopeKey === currentScopeKey.value) {
      return
    }

    resetForScope(nextScopeKey)
  })

  return {
    currentScopeKey,
    errorMessage,
    hasLoadedOrderList,
    isLoadingOrderList,
    isOrderListStale,
    cancelOrder,
    confirmReceipt,
    loadOrderList,
    markOrderListStale,
    orderListPageData,
    orderSummary,
    payOrderById,
    recordSubmittedOrder,
  }
})

function resolveTradeScopeKey(userId: string | null) {
  return userId ?? 'guest'
}
