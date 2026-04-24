<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { useBackendRuntime } from '@/app/providers/backend'
import { OrderProductRow, OrderStoreHeader } from '@/entities/order'
import LoadingState from '@/shared/ui/LoadingState.vue'

import { useCheckoutFlowStore } from '../model/useCheckoutFlowStore'

const checkoutStore = useCheckoutFlowStore()
const route = useRoute()
const router = useRouter()
const runtime = useBackendRuntime()

interface CheckoutPaymentOption {
  availableAmount: number
  balanceTypeId: number
  balanceTypeName: string
  deductAmount: number
}

interface MerchantSubtotalBreakdown {
  merchantId: number
  merchantName: string
  totalAmount: number
}

const {
  confirmation,
  errorMessage,
  isCheckoutEnabled,
  isLoading,
  isSubmitting,
  preview,
  selectedAddress,
  submissionMessage,
} = storeToRefs(checkoutStore)

const previewLines = computed(() => preview.value?.lines ?? [])
const previewBalanceGroups = computed(() => preview.value?.groups ?? [])
const isCouponEnabled = computed(() => runtime.capabilities.coupon)
const isInvoiceEnabled = computed(() => runtime.capabilities.invoice)
const previewCouponGroups = computed(() => (isCouponEnabled.value ? previewBalanceGroups.value : []))
const payableAmountText = computed(() => formatAmount(preview.value?.payableAmount ?? 0))
const subtotalAmountText = computed(() => formatAmount(preview.value?.subtotalAmount ?? 0))
const discountAmountText = computed(() => formatAmount(preview.value?.discountAmount ?? 0))
const merchantTitle = computed(() => preview.value?.source === 'cart' ? '购物车商品' : '立即购买商品')
const hasInsufficientBalance = computed(() => previewBalanceGroups.value.some((group) => group.payableAmount > resolveGroupPlannedDeductionAmount(group)))
const insufficientBalanceMessage = computed(() => {
  const insufficientMerchants = new Set(
    previewBalanceGroups.value
      .filter((group) => group.payableAmount > resolveGroupPlannedDeductionAmount(group))
      .map((group) => group.merchantName.trim())
      .filter(Boolean),
  )

  return [...insufficientMerchants]
    .map((merchantName) => `${merchantName}可用余额不足`)
    .join('；')
})

const paymentOptions = computed<CheckoutPaymentOption[]>(() => {
  const paymentOptionMap = new Map<number, CheckoutPaymentOption>()

  previewBalanceGroups.value.forEach((group) => {
    group.balanceDeductions.forEach((deduction) => {
      const currentOption = paymentOptionMap.get(deduction.balanceTypeId)

      if (!currentOption) {
        paymentOptionMap.set(deduction.balanceTypeId, {
          availableAmount: deduction.availableAmount,
          balanceTypeId: deduction.balanceTypeId,
          balanceTypeName: deduction.balanceTypeName,
          deductAmount: deduction.deductAmount,
        })
        return
      }

      currentOption.availableAmount = Math.max(currentOption.availableAmount, deduction.availableAmount)
      currentOption.deductAmount += deduction.deductAmount
    })
  })

  return [...paymentOptionMap.values()].sort((left, right) => left.balanceTypeId - right.balanceTypeId)
})
const subtotalBreakdownText = computed(() => {
  const subtotalBreakdownMap = new Map<number, MerchantSubtotalBreakdown>()

  previewBalanceGroups.value.forEach((group) => {
    const currentItem = subtotalBreakdownMap.get(group.merchantId)

    if (!currentItem) {
      subtotalBreakdownMap.set(group.merchantId, {
        merchantId: group.merchantId,
        merchantName: group.merchantName,
        totalAmount: group.totalAmount,
      })
      return
    }

    currentItem.totalAmount += group.totalAmount
  })

  return [...subtotalBreakdownMap.values()]
    .sort((left, right) => left.merchantId - right.merchantId)
    .map((item) => `${formatAmount(item.totalAmount)}(${item.merchantName || `商户#${item.merchantId}`})`)
    .join('+')
})
const paymentMethodLabel = computed(() =>
  paymentOptions.value.length > 1 ? '按商家余额优先级组合扣款' : (paymentOptions.value[0]?.balanceTypeName ?? '余额账户支付'),
)
const buyerMessage = ref('')
const selectedAddressQueryId = computed(() =>
  typeof route.query.selectedAddressId === 'string'
    ? route.query.selectedAddressId
    : '',
)
const addressTitle = computed(() =>
  selectedAddress.value
    ? `${selectedAddress.value.recipientName} ${selectedAddress.value.recipientMobile}`
    : preview.value
      ? '请选择收货地址'
    : '请先生成结算预览',
)
const addressDetail = computed(() =>
  selectedAddress.value
    ? [selectedAddress.value.province, selectedAddress.value.city, selectedAddress.value.county, selectedAddress.value.addressDetail]
      .filter(Boolean)
      .join(' ')
    : preview.value
      ? '请先选择收货地址，再提交订单。'
    : '当前页面需要先加载结算预览后再展示订单信息。',
)

function openAddressSelector() {
  void router.push({
    name: 'member-addresses',
    query: {
      mode: 'select',
      returnTo: 'checkout',
      selectedAddressId: selectedAddress.value?.id,
    },
  })
}

function openCouponSelector(merchantId: number, balanceTypeId: number) {
  if (!isCouponEnabled.value) {
    return
  }

  void router.push({
    name: 'checkout-coupons',
    query: {
      balanceTypeId: String(balanceTypeId),
      merchantId: String(merchantId),
    },
  })
}

async function consumeSelectedAddressQuery(addressId: string) {
  try {
    await checkoutStore.selectAddress(addressId)
  } catch {
    showFailToast(errorMessage.value ?? '地址选择失败')
  } finally {
    const nextQuery = { ...route.query }

    delete nextQuery.selectedAddressId

    await router.replace({
      query: Object.keys(nextQuery).length > 0 ? nextQuery : undefined,
    })
  }
}

async function handleSubmit() {
  try {
    const submitSource = preview.value?.source ?? null
    const submitProductId = previewLines.value[0]?.productId ?? null
    const result = await checkoutStore.submitCurrentOrder(buyerMessage.value)

    if (result) {
      await navigateAfterSubmit(submitSource, submitProductId)
      showSuccessToast('支付成功')
    }
  } catch {
    showFailToast(errorMessage.value ?? '提交订单失败')
  }
}

async function navigateAfterSubmit(
  submitSource: 'cart' | 'instant' | null,
  submitProductId: string | null,
) {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  if (submitSource === 'instant' && submitProductId) {
    await router.push({
      name: 'product-detail',
      params: {
        productId: submitProductId,
      },
    })
    return
  }

  await router.push('/cart')
}

onMounted(() => {
  if (isCheckoutEnabled.value) {
    void checkoutStore.loadPreview()
  }
})

watch(
  selectedAddressQueryId,
  (addressId) => {
    if (!addressId) {
      return
    }

    void consumeSelectedAddressQuery(addressId)
  },
  { immediate: true },
)

function formatAmount(value: number) {
  return value.toFixed(2)
}

function resolveGroupPlannedDeductionAmount(group: (typeof previewBalanceGroups.value)[number]) {
  if (group.balanceDeductions.length > 0) {
    return group.balanceDeductions.reduce((sum, item) => sum + item.deductAmount, 0)
  }

  return group.availableBalance
}

function formatPaymentOptionValue(option: CheckoutPaymentOption) {
  return `扣款¥${formatAmount(option.deductAmount)}/余额¥${formatAmount(option.availableAmount)}`
}

function formatCouponGroupLabel(merchantName: string, balanceTypeName: string) {
  if (merchantName && balanceTypeName) {
    return `${merchantName}-${balanceTypeName}优惠券`
  }

  if (merchantName) {
    return `${merchantName}优惠券`
  }

  if (balanceTypeName) {
    return `${balanceTypeName}优惠券`
  }

  return '优惠券'
}

function formatCouponGroupValue(
  couponName: string | null,
  couponAmount: number,
  couponError: string | null,
  availableCouponCount: number,
) {
  if (couponError) {
    return couponError
  }

  if (couponName && couponAmount > 0) {
    return `${couponName} -¥${formatAmount(couponAmount)}`
  }

  if (couponName) {
    return couponName
  }

  if (couponAmount > 0) {
    return `已优惠 ¥${formatAmount(couponAmount)}`
  }

  if (availableCouponCount > 0) {
    return `${availableCouponCount} 张可用`
  }

  return '无可用优惠券'
}

</script>

<template>
  <section class="checkout-panel">
    <div class="checkout-body">
      <p v-if="!isCheckoutEnabled" class="state-card">
        当前租户未启用 checkout 模块，因此不会装配结算流程。
      </p>

      <template v-else>
        <LoadingState v-if="isLoading" class="state-card" />
        <p v-else-if="errorMessage" class="state-card state-card-error">
          {{ errorMessage }}
        </p>

        <template v-else-if="preview">
          <van-cell-group class="checkout-cell-group address-card">
            <van-cell is-link center class="address-cell" @click="openAddressSelector">
              <template #icon>
                <van-icon name="location-o" size="18" class="address-icon" />
              </template>
              <template #title>
                <div class="address-copy">
                  <strong>{{ addressTitle }}</strong>
                  <span>{{ addressDetail }}</span>
                </div>
              </template>
            </van-cell>
          </van-cell-group>

          <van-cell-group class="checkout-cell-group meta-card">
            <van-cell title="支付方式：" :value="paymentMethodLabel" />
            <van-cell
              v-for="option in paymentOptions"
              :key="`payment-option-${option.balanceTypeId}`"
              :title="`${option.balanceTypeName}：`"
              :value="formatPaymentOptionValue(option)"
            />
            <van-cell v-if="isInvoiceEnabled" title="发票信息：" value="暂不支持" />
          </van-cell-group>

          <p v-if="hasInsufficientBalance" class="state-card state-card-error">
            余额不足：{{ insufficientBalanceMessage }}
          </p>

          <section class="merchant-card">
            <OrderStoreHeader :store-name="merchantTitle" status-text="" />

            <OrderProductRow
              v-for="line in previewLines"
              :key="line.productId"
              :image-alt="line.productName"
              :image-url="line.productImageUrl || undefined"
              :price-text="formatAmount(line.unitPrice)"
              :product-name="line.productName"
              :quantity-text="`${line.quantity}件`"
              :to="{ name: 'product-detail', params: { productId: line.productId } }"
            />

            <div class="merchant-row">
              <span class="merchant-row-label">物流配送</span>
              <span class="merchant-row-value">运费0.00</span>
            </div>

            <button
              v-for="group in previewCouponGroups"
              :key="`${group.merchantId}-${group.balanceTypeId}`"
              class="merchant-row merchant-row-button"
              type="button"
              @click="openCouponSelector(group.merchantId, group.balanceTypeId)"
            >
              <span class="merchant-row-label">{{ formatCouponGroupLabel(group.merchantName, group.balanceTypeName) }}</span>
              <span class="merchant-row-main">
                <span
                  class="merchant-row-value"
                  :class="{ 'merchant-row-value-error': Boolean(group.couponError) }"
                >
                  {{ formatCouponGroupValue(group.couponName, group.couponAmount, group.couponError, group.availableCoupons.length) }}
                </span>
                <van-icon class="merchant-row-arrow" name="arrow" />
              </span>
            </button>

            <van-field
              v-model="buyerMessage"
              class="merchant-note-field"
              label="店铺订单留言："
              rows="1"
              autosize
              type="textarea"
              maxlength="100"
              placeholder="选填，可填写与商家协商好的补充信息"
              show-word-limit
            />

          </section>

          <section v-if="submissionMessage || confirmation" class="feedback-card">
            <p v-if="submissionMessage" class="feedback-message">
              {{ submissionMessage }}
            </p>
            <p v-if="confirmation" class="feedback-time">
              提交时间：{{ confirmation.submittedAt }}
            </p>
          </section>

          <section class="explain-card">
            <div class="explain-row">
              <span>商品小计</span>
              <div class="explain-subtotal">
                <span v-if="subtotalBreakdownText" class="explain-subtotal-breakdown">{{ subtotalBreakdownText }}</span>
                <strong class="explain-subtotal-total">{{ subtotalAmountText }}</strong>
              </div>
            </div>
            <div class="explain-row">
              <span>优惠减免</span>
              <strong class="explain-amount">{{ discountAmountText }}</strong>
            </div>
          </section>
        </template>
      </template>
    </div>

    <van-submit-bar
      class="checkout-submit-bar"
      :price="Math.round((preview?.payableAmount ?? 0) * 100)"
      button-text="提交订单"
      :loading="isSubmitting"
      :disabled="!preview || !isCheckoutEnabled || isLoading || hasInsufficientBalance"
      @submit="handleSubmit"
    />
  </section>
</template>

<style scoped>
.checkout-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  height: 100%;
}

.checkout-body {
  display: grid;
  gap: 12px;
  align-content: start;
  min-height: 0;
  padding: 12px 0 24px;
  overflow-y: auto;
  scrollbar-width: none;
}

.checkout-body::-webkit-scrollbar {
  display: none;
}

.state-card,
.merchant-card,
.feedback-card,
.explain-card {
  background: #fff;
}

.state-card {
  margin: 0;
  padding: 18px 16px;
  color: #6d6c6a;
  font-size: 14px;
  line-height: 1.6;
}

.state-card-error {
  color: #c95a21;
}

.checkout-cell-group {
  background: #fff;
}

.address-icon {
  color: #d89575;
}

.address-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.address-copy strong {
  color: #3c3b39;
  font-size: 15px;
  font-weight: 600;
}

.address-copy span {
  color: #6d6c6a;
  font-size: 13px;
  line-height: 1.4;
}

.merchant-card {
  display: grid;
}

.merchant-card :deep(.store-status) {
  display: none;
}

.merchant-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 16px;
  border-top: 1px solid #f1eeea;
}

.merchant-row-button {
  width: 100%;
  border-right: 0;
  border-bottom: 0;
  border-left: 0;
  background: transparent;
  text-align: left;
}

.merchant-row-main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.merchant-row-label {
  color: #3c3b39;
  font-size: 14px;
  font-weight: 500;
}

.merchant-row-value {
  color: #6d6c6a;
  font-size: 14px;
  font-weight: 500;
}

.merchant-row-value-error {
  color: #c95a21;
}

.merchant-row-arrow {
  color: #b9b2a8;
  font-size: 14px;
}

.explain-amount {
  color: #ea580c;
  font-size: 18px;
  font-weight: 700;
}

.explain-subtotal {
  display: inline-flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.explain-subtotal-breakdown {
  color: #8c867e;
  font-size: 12px;
  font-weight: 500;
  text-align: right;
}

.explain-subtotal-total {
  color: #3c3b39;
  font-size: 16px;
  font-weight: 700;
}

.feedback-card {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
}

.feedback-message,
.feedback-time {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.feedback-message {
  color: #2f7d55;
}

.feedback-time {
  color: #6d6c6a;
}

.explain-card {
  display: grid;
}

.explain-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 0 16px;
}

.explain-row + .explain-row {
  border-top: 1px solid #f1eeea;
}

.explain-row span {
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
}

.explain-value {
  color: #3c3b39;
  font-size: 14px;
  font-weight: 600;
}

.address-card :deep(.van-cell),
.meta-card :deep(.van-cell) {
  padding: 14px 16px;
  background: #fff;
}

.address-card :deep(.van-cell__left-icon),
.address-card :deep(.van-cell__right-icon),
.meta-card :deep(.van-cell__right-icon) {
  color: #a8a7a5;
}

.address-card :deep(.van-cell__left-icon) {
  margin-right: 10px;
}

.address-card :deep(.van-cell__title),
.meta-card :deep(.van-cell__title) {
  color: #3c3b39;
  font-size: 14px;
  font-weight: 500;
}

.meta-card :deep(.van-cell__value) {
  color: #6d6c6a;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.merchant-note-field {
  --van-field-label-color: #6d6c6a;
  --van-field-placeholder-text-color: #b4b1ac;
  --van-field-word-limit-color: #b4b1ac;
  --van-cell-background: #f5f4f1;
}

.merchant-note-field :deep(.van-field__label) {
  width: 104px;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
}

.merchant-note-field :deep(.van-field__value) {
  color: #3c3b39;
  font-size: 13px;
}

.merchant-note-field :deep(.van-field__control) {
  color: #3c3b39;
  font-size: 13px;
  line-height: 1.5;
}

.merchant-note-field :deep(.van-field__word-limit) {
  margin-top: 6px;
  font-size: 11px;
}

.checkout-submit-bar {
  position: static;
  inset: auto;
  padding-bottom: 0;
}

</style>
