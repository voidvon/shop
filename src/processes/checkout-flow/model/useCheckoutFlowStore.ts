import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useMemberAuthSession } from '@/entities/member-auth'
import {
  useMemberAddressStore,
} from '@/entities/member-address'
import { useCheckoutFlowPort } from '@/processes/checkout-flow'
import { useTradeStore } from '@/processes/trade'
import { useModuleAvailability } from '@/shared/lib/modules'
import type { BalanceAccountInfo } from '@/shared/types/modules'
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
  useMemberAssetsService,
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
  const balanceAccounts = ref<BalanceAccountInfo[]>([])
  const availableBalance = ref(0)
  const submissionMessage = ref<string | null>(null)

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

  function syncBalanceSnapshot(snapshot: Awaited<ReturnType<typeof getMemberAssetsSnapshot>>) {
    balanceAccounts.value = snapshot.balanceAccounts.map((account) => ({ ...account }))
    availableBalance.value = snapshot.balanceAmount
  }

  function findInsufficientBalanceGroups(targetPreview: CheckoutPreview | null) {
    return (targetPreview?.groups ?? []).filter((group) => group.payableAmount > group.availableBalance)
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

      syncBalanceSnapshot(await getMemberAssetsSnapshot(memberAssetsService))
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
      const insufficientGroups = findInsufficientBalanceGroups(preview.value)

      if (insufficientGroups.length > 0) {
        errorMessage.value = insufficientGroups
          .map((group) => `${group.merchantName}-${group.balanceTypeName} 余额不足`)
          .join('；')
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

      syncBalanceSnapshot(await getMemberAssetsSnapshot(memberAssetsService))
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
    balanceAccounts,
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
    submissionMessage,
    submitCurrentOrder,
    syncSelectedAddress,
  }
})
