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
  createBrowserOrderRepository,
  createCheckoutPreview,
  type CheckoutCouponUsage,
  type CheckoutPreviewGroup,
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
  clearInstantCheckoutDraft,
  readInstantCheckoutDraft,
  simulatedInstantOrderNamespace,
} from './instant-checkout-draft'

export const useCheckoutFlowStore = defineStore('checkout-flow', () => {
  const checkoutFlowPort = useCheckoutFlowPort()
  const memberAddressStore = useMemberAddressStore()
  const memberAssetsService = useMemberAssetsService()
  const memberAuthSession = useMemberAuthSession()
  const tradeStore = useTradeStore()
  const isCheckoutEnabled = useModuleAvailability('checkout')
  const simulatedInstantOrderRepository = createBrowserOrderRepository({
    defaultStoreName: '立即购买',
    getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
    getSeedRecords: () => [],
    namespace: simulatedInstantOrderNamespace,
  })

  const confirmation = ref<OrderConfirmation | null>(null)
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const preview = ref<CheckoutPreview | null>(null)
  const selectedCouponUsages = ref<CheckoutCouponUsage[]>([])
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

  function isSameCouponGroup(
    left: Pick<CheckoutCouponUsage, 'balanceTypeId' | 'merchantId'>,
    right: Pick<CheckoutCouponUsage, 'balanceTypeId' | 'merchantId'>,
  ) {
    return left.balanceTypeId === right.balanceTypeId && left.merchantId === right.merchantId
  }

  function findCouponGroup(merchantId: number, balanceTypeId: number) {
    return preview.value?.groups.find((group) =>
      group.merchantId === merchantId && group.balanceTypeId === balanceTypeId,
    ) ?? null
  }

  async function loadPreview(options?: { couponUsages?: CheckoutCouponUsage[] }) {
    if (!isCheckoutEnabled.value) {
      preview.value = null
      selectedCouponUsages.value = []
      hasLoaded.value = true
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const instantCheckoutDraft = readInstantCheckoutDraft()
      const nextCouponUsages = options?.couponUsages ?? selectedCouponUsages.value

      if (instantCheckoutDraft) {
        preview.value = createCheckoutPreview(instantCheckoutDraft)
        selectedCouponUsages.value = []
      } else {
        preview.value = await checkoutFlowPort.getPreview(nextCouponUsages)
        selectedCouponUsages.value = preview.value.couponUsages
      }

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

  async function applyCouponSelection(group: CheckoutPreviewGroup, userCouponId: number | null) {
    const nextCouponUsages = selectedCouponUsages.value.filter((couponUsage) =>
      !isSameCouponGroup(couponUsage, group),
    )

    if (userCouponId !== null) {
      nextCouponUsages.push({
        balanceTypeId: group.balanceTypeId,
        merchantId: group.merchantId,
        userCouponId,
      })
    }

    await loadPreview({
      couponUsages: nextCouponUsages,
    })
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
      const instantCheckoutDraft = readInstantCheckoutDraft()
      const payableAmount = preview.value?.payableAmount ?? 0

      if (payableAmount > availableBalance.value) {
        errorMessage.value = `账户余额不足，当前余额 ${availableBalance.value.toFixed(2)}`
        throw new Error(errorMessage.value)
      }

      const result = instantCheckoutDraft
        ? {
            confirmation: await simulatedInstantOrderRepository.submit({
              ...instantCheckoutDraft,
              addressId: selectedAddress.value.id,
              remark: remark?.trim() ? remark.trim() : null,
            }),
            preview: createCheckoutPreview({
              lines: [],
              source: 'instant',
            }),
          }
        : await checkoutFlowPort.submit({
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

      if (instantCheckoutDraft) {
        clearInstantCheckoutDraft()
      }

      return result.confirmation
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '提交订单失败'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  memberAuthSession.subscribe(() => {
    selectedCouponUsages.value = []
    selectedAddressId.value = null
    clearInstantCheckoutDraft()
  })

  return {
    availableBalance,
    confirmation,
    errorMessage,
    findCouponGroup,
    hasLoaded,
    isCheckoutEnabled,
    isLoading,
    isSubmitting,
    applyCouponSelection,
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
