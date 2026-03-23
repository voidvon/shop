import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useMemberAuthSession } from '@/entities/member-auth'
import {
  useMemberAddressStore,
} from '@/entities/member-address'
import { useCheckoutFlowPort } from '@/processes/checkout-flow'
import { useTradeStore } from '@/processes/trade'
import { useModuleAvailability } from '@/shared/lib/modules'
import {
  type CheckoutPreview,
  type OrderConfirmation,
} from '@/entities/order'
import {
  getMemberAssetsSnapshot,
  spendMemberBalance,
  useMemberAssetsService,
  type SpendMemberBalanceCommand,
} from '@/processes/member-center'

export const useCheckoutFlowStore = defineStore('checkout-flow', () => {
  const checkoutFlowPort = useCheckoutFlowPort()
  const memberAddressStore = useMemberAddressStore()
  const memberAssetsService = useMemberAssetsService()
  const memberAuthSession = useMemberAuthSession()
  const tradeStore = useTradeStore()
  const isCheckoutEnabled = useModuleAvailability('checkout')

  const confirmation = ref<OrderConfirmation | null>(null)
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const preview = ref<CheckoutPreview | null>(null)
  const selectedAddressId = ref<string | null>(null)
  const selectedAddress = computed(() =>
    memberAddressStore.resolveSelectedAddress(selectedAddressId.value ?? undefined),
  )
  const availableBalance = ref(0)
  const submissionMessage = ref<string | null>(null)
  const sourceLabel = computed(() =>
    preview.value?.source === 'cart' ? '从购物车进入' : '从立即购买进入',
  )

  async function syncSelectedAddress(options?: { preferredAddressId?: string }) {
    await memberAddressStore.syncCurrentUserAddresses()

    const nextSelectedAddress = memberAddressStore.resolveSelectedAddress(
      options?.preferredAddressId ?? selectedAddressId.value ?? undefined,
    )

    selectedAddressId.value = nextSelectedAddress?.id ?? null

    return nextSelectedAddress
  }

  async function selectAddress(addressId: string) {
    const nextSelectedAddress = await syncSelectedAddress({ preferredAddressId: addressId })

    if (!nextSelectedAddress || nextSelectedAddress.id !== addressId) {
      throw new Error('当前地址不存在')
    }

    return nextSelectedAddress
  }

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
      const assetsSnapshot = await getMemberAssetsSnapshot(memberAssetsService)
      availableBalance.value = assetsSnapshot.balanceAmount
      await syncSelectedAddress()
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

    await syncSelectedAddress()

    if (!selectedAddress.value) {
      errorMessage.value = '请先选择收货地址'
      throw new Error('请先选择收货地址')
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
      const payableAmount = preview.value?.payableAmount ?? 0

      if (payableAmount > availableBalance.value) {
        errorMessage.value = `账户余额不足，当前余额 ${availableBalance.value.toFixed(2)}`
        throw new Error(errorMessage.value)
      }

      const result = await checkoutFlowPort.submit()
      const spendCommand: SpendMemberBalanceCommand = {
        amount: result.confirmation.payableAmount,
        description: `商城订单 ${result.confirmation.orderId} 余额支付`,
      }
      availableBalance.value = await spendMemberBalance(memberAssetsService, spendCommand)
      confirmation.value = result.confirmation
      submissionMessage.value = `订单 ${result.confirmation.orderId} 已提交，已使用账户余额支付 ${result.confirmation.payableAmount}`
      preview.value = result.preview
      await tradeStore.recordSubmittedOrder(result.confirmation, result.preview)
      return result.confirmation
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '提交订单失败'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  memberAuthSession.subscribe(() => {
    selectedAddressId.value = null
  })

  return {
    availableBalance,
    confirmation,
    errorMessage,
    hasLoaded,
    isCheckoutEnabled,
    isLoading,
    isSubmitting,
    loadPreview,
    preview,
    selectAddress,
    selectedAddress,
    sourceLabel,
    submissionMessage,
    submitCurrentOrder,
    syncSelectedAddress,
  }
})
