import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useCheckoutFlowPort } from '@/processes/checkout-flow'
import { useModuleAvailability } from '@/shared/lib/modules'
import {
  type CheckoutPreview,
  type OrderConfirmation,
} from '@/entities/order'

export const useCheckoutFlowStore = defineStore('checkout-flow', () => {
  const checkoutFlowPort = useCheckoutFlowPort()
  const isCheckoutEnabled = useModuleAvailability('checkout')

  const confirmation = ref<OrderConfirmation | null>(null)
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const preview = ref<CheckoutPreview | null>(null)
  const submissionMessage = ref<string | null>(null)
  const sourceLabel = computed(() =>
    preview.value?.source === 'cart' ? '从购物车进入' : '从立即购买进入',
  )

  async function loadPreview() {
    if (!isCheckoutEnabled.value) {
      preview.value = null
      hasLoaded.value = true
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      preview.value = await checkoutFlowPort.getPreview()
      confirmation.value = null
      submissionMessage.value = null
      hasLoaded.value = true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '结算预览加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function submitCurrentOrder() {
    if (!isCheckoutEnabled.value) {
      return
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
      const result = await checkoutFlowPort.submit()
      confirmation.value = result.confirmation
      submissionMessage.value = `订单 ${result.confirmation.orderId} 已提交，应付 ${result.confirmation.payableAmount}`
      preview.value = result.preview
      return result.confirmation
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '提交订单失败'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    confirmation,
    errorMessage,
    hasLoaded,
    isCheckoutEnabled,
    isLoading,
    isSubmitting,
    loadPreview,
    preview,
    sourceLabel,
    submissionMessage,
    submitCurrentOrder,
  }
})
