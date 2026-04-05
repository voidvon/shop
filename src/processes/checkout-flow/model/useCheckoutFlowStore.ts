import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useCartStore } from '@/features/add-to-cart'
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
import {
  clearInstantCheckoutBridge,
  readInstantCheckoutBridge,
} from './instant-checkout-bridge'

export const useCheckoutFlowStore = defineStore('checkout-flow', () => {
  const cartStore = useCartStore()
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
  const sourceType = ref<'cart' | 'instant'>('cart')
  const selectedAddressId = ref<string | null>(null)
  const selectedAddress = computed(() =>
    memberAddressStore.resolveSelectedAddress(selectedAddressId.value ?? undefined),
  )
  const availableBalance = ref(0)
  const submissionMessage = ref<string | null>(null)
  const sourceLabel = computed(() =>
    sourceType.value === 'instant' ? '从立即购买进入' : '从购物车进入',
  )

  function syncSourceType() {
    sourceType.value = readInstantCheckoutBridge() ? 'instant' : (preview.value?.source ?? 'cart')
  }

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
      syncSourceType()
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

  async function submitCurrentOrder(remark?: string) {
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
      const instantCheckoutBridge = readInstantCheckoutBridge()
      const payableAmount = preview.value?.payableAmount ?? 0

      if (payableAmount > availableBalance.value) {
        errorMessage.value = `账户余额不足，当前余额 ${availableBalance.value.toFixed(2)}`
        throw new Error(errorMessage.value)
      }

      const result = await checkoutFlowPort.submit({
        addressId: selectedAddress.value.id,
        couponUsages: preview.value?.couponUsages ?? [],
        remark: remark?.trim() ? remark.trim() : null,
      })

      const spendCommand: SpendMemberBalanceCommand = {
        amount: result.confirmation.payableAmount,
        description: `商城订单 ${result.confirmation.orderId} 余额支付`,
      }
      availableBalance.value = await spendMemberBalance(memberAssetsService, spendCommand)
      confirmation.value = result.confirmation
      submissionMessage.value = `订单 ${result.confirmation.orderId} 已提交，已使用账户余额支付 ${result.confirmation.payableAmount}`
      preview.value = result.preview
      await tradeStore.recordSubmittedOrder(result.confirmation, result.preview)

      if (instantCheckoutBridge) {
        await restoreInstantCheckoutCartState()
      }

      syncSourceType()

      return result.confirmation
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '提交订单失败'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  async function restoreInstantCheckoutCartState() {
    const instantCheckoutBridge = readInstantCheckoutBridge()

    if (!instantCheckoutBridge) {
      return
    }

    try {
      await cartStore.loadSnapshot()

      const targetLine = cartStore.snapshot.lines.find((line) => line.lineId === instantCheckoutBridge.lineId)

      if (targetLine) {
        if (instantCheckoutBridge.previousQuantity === null) {
          await cartStore.removeProduct(targetLine.lineId)
        } else if (targetLine.quantity !== instantCheckoutBridge.previousQuantity) {
          await cartStore.setProductQuantity(targetLine.lineId, instantCheckoutBridge.previousQuantity)
        }
      } else if (instantCheckoutBridge.previousLine) {
        await cartStore.addProduct(
          {
            category: '',
            categoryId: '',
            coverImageUrl: instantCheckoutBridge.previousLine.productImageUrl ?? null,
            id: instantCheckoutBridge.previousLine.productId,
            inventory: Math.max(instantCheckoutBridge.previousLine.quantity, 1),
            monthlySales: 0,
            name: instantCheckoutBridge.previousLine.productName,
            price: instantCheckoutBridge.previousLine.unitPrice,
            summary: '',
            tags: [],
          },
          {
            quantity: instantCheckoutBridge.previousLine.quantity,
            skuId: instantCheckoutBridge.previousLine.skuId,
            specText: instantCheckoutBridge.previousLine.specText,
            unitPrice: instantCheckoutBridge.previousLine.unitPrice,
          },
        )
      }

      await cartStore.loadSnapshot()

      const existingLineIds = cartStore.snapshot.lines.map((line) => line.lineId)

      if (existingLineIds.length > 0) {
        await cartStore.setLinesSelected(existingLineIds, false)
      }

      const restoreSelectedLineIds = instantCheckoutBridge.previousSelectedLineIds.filter((lineId) =>
        existingLineIds.includes(lineId),
      )

      if (restoreSelectedLineIds.length > 0) {
        await cartStore.setLinesSelected(restoreSelectedLineIds, true)
      }
    } finally {
      clearInstantCheckoutBridge()
    }
  }

  memberAuthSession.subscribe(() => {
    selectedAddressId.value = null
    clearInstantCheckoutBridge()
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
    restoreInstantCheckoutCartState,
    selectAddress,
    selectedAddress,
    sourceLabel,
    sourceType,
    submissionMessage,
    submitCurrentOrder,
    syncSelectedAddress,
  }
})
