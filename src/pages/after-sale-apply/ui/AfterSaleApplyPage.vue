<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'

import type { AfterSaleApplicationType } from '@/entities/after-sale'
import ProductMediaRow from '@/shared/ui/ProductMediaRow.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useAfterSaleApplyPageModel } from '../model/useAfterSaleApplyPageModel'

function normalizeRouteParam(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function normalizeRouteType(value: unknown): AfterSaleApplicationType {
  return value === 'return' ? 'return' : 'refund'
}

const route = useRoute()
const router = useRouter()
const {
  currentItem,
  errorMessage,
  isLoading,
  loadAfterSaleApplyPage,
  orderDetailPageData,
  submitAfterSaleApplication,
} = useAfterSaleApplyPageModel()

const orderId = ref(normalizeRouteParam(route.params.orderId))
const orderItemId = ref(normalizeRouteParam(route.params.orderItemId))
const activeType = ref<AfterSaleApplicationType>(normalizeRouteType(route.query.type))
const selectedReason = ref('')
const description = ref('')
const applyQuantity = ref(1)

const activeItem = computed(() => currentItem.value(orderItemId.value))
const refundAmount = computed(() => {
  if (!activeItem.value) {
    return 0
  }

  const safeQuantity = Math.max(1, Math.min(applyQuantity.value, activeItem.value.quantity))
  return safeQuantity * activeItem.value.unitPrice
})

const refundReasons = ['拍错商品', '不想要了', '商品与描述不符', '发货太慢']
const returnReasons = ['尺码/规格不符', '商品破损', '收到错货', '质量问题']

const reasonOptions = computed(() => (activeType.value === 'refund' ? refundReasons : returnReasons))

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({
    name: 'member-order-detail',
    params: {
      orderId: orderId.value,
    },
  })
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function resolveImage(imageUrl: string | null) {
  return imageUrl || undefined
}

function selectType(type: AfterSaleApplicationType) {
  activeType.value = type
  selectedReason.value = ''
  void router.replace({
    query: {
      type,
    },
  })
}

function validateForm() {
  if (!activeItem.value || !orderDetailPageData.value) {
    showToast('订单商品不存在')
    return false
  }

  if (!selectedReason.value) {
    showToast(`请选择${activeType.value === 'refund' ? '退款' : '退货'}原因`)
    return false
  }

  if (applyQuantity.value < 1 || applyQuantity.value > activeItem.value.quantity) {
    showToast('申请数量超出可售后范围')
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validateForm() || !orderDetailPageData.value) {
    return
  }

  const result = await submitAfterSaleApplication({
    description: description.value,
    orderId: orderId.value,
    orderItemId: orderItemId.value,
    paymentMethod: orderDetailPageData.value.paymentMethod ?? '账户余额',
    quantity: applyQuantity.value,
    reason: selectedReason.value,
    type: activeType.value,
  })

  showSuccessToast(activeType.value === 'refund' ? '退款申请已提交' : '退货申请已提交')

  await router.replace({
    name: activeType.value === 'refund' ? 'member-refund-detail' : 'member-return-detail',
    params: {
      refundId: result.refundId,
    },
  })
}

watch(
  () => [route.params.orderId, route.params.orderItemId, route.query.type],
  ([nextOrderId, nextOrderItemId, nextType]) => {
    orderId.value = normalizeRouteParam(nextOrderId)
    orderItemId.value = normalizeRouteParam(nextOrderItemId)
    activeType.value = normalizeRouteType(nextType)

    if (!orderId.value) {
      return
    }

    void loadAfterSaleApplyPage(orderId.value).then(() => {
      applyQuantity.value = Math.max(1, Math.min(applyQuantity.value, activeItem.value?.quantity ?? 1))
    })
  },
  { immediate: true },
)

onMounted(() => {
  if (!orderId.value) {
    return
  }

  void loadAfterSaleApplyPage(orderId.value)
})
</script>

<template>
  <section class="after-sale-apply-page">
    <PageTopBar title="申请售后" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <p v-else-if="isLoading" class="status-text">
        售后申请信息加载中...
      </p>

      <EmptyState
        v-else-if="!orderDetailPageData || !activeItem"
        description="订单商品不存在，暂时无法发起售后申请。"
        description-width="240px"
        icon="warning-o"
        layout="fill"
        title="无法申请售后"
      />

      <template v-else>
        <section class="type-card">
          <button
            class="type-button"
            :class="{ 'type-button-active': activeType === 'refund' }"
            type="button"
            @click="selectType('refund')"
          >
            退款申请
          </button>

          <button
            class="type-button"
            :class="{ 'type-button-active': activeType === 'return' }"
            type="button"
            @click="selectType('return')"
          >
            退货申请
          </button>
        </section>

        <section class="goods-card">
          <header class="section-header">
            <strong>售后商品</strong>
          </header>

          <ProductMediaRow
            :image-alt="activeItem.productName"
            :image-url="resolveImage(activeItem.productImageUrl)"
            :meta-text="activeItem.skuDescription ?? undefined"
            :price-text="formatAmount(activeItem.unitPrice)"
            :title="activeItem.productName"
            :trailing-text="`x${activeItem.quantity}`"
          />
        </section>

        <section class="form-card">
          <header class="section-header">
            <strong>{{ activeType === 'refund' ? '退款信息' : '退货信息' }}</strong>
          </header>

          <div class="form-body">
            <div class="field-block">
              <span class="field-label">申请原因</span>
              <div class="reason-grid">
                <button
                  v-for="reason in reasonOptions"
                  :key="reason"
                  class="reason-chip"
                  :class="{ 'reason-chip-active': selectedReason === reason }"
                  type="button"
                  @click="selectedReason = reason"
                >
                  {{ reason }}
                </button>
              </div>
            </div>

            <div class="field-block">
              <span class="field-label">申请数量</span>
              <div class="quantity-row">
                <button
                  class="step-button"
                  type="button"
                  @click="applyQuantity = Math.max(1, applyQuantity - 1)"
                >
                  -
                </button>

                <span class="quantity-value">{{ applyQuantity }}</span>

                <button
                  class="step-button"
                  type="button"
                  @click="applyQuantity = Math.min(activeItem.quantity, applyQuantity + 1)"
                >
                  +
                </button>

                <small>最多 {{ activeItem.quantity }} 件</small>
              </div>
            </div>

            <div class="field-block">
              <span class="field-label">补充说明</span>
              <textarea
                v-model="description"
                class="description-input"
                placeholder="可补充商品问题、退货原因等说明"
                rows="4"
              />
            </div>
          </div>
        </section>

        <section class="summary-card">
          <div class="summary-row">
            <span>原支付方式</span>
            <strong>{{ orderDetailPageData.paymentMethod ?? '账户余额' }}</strong>
          </div>
          <div class="summary-row">
            <span>预计退款金额</span>
            <strong class="summary-amount">{{ formatAmount(refundAmount) }}</strong>
          </div>
        </section>
      </template>
    </div>

    <footer v-if="orderDetailPageData && activeItem" class="action-footer">
      <button class="primary-button" type="button" @click="handleSubmit">提交申请</button>
    </footer>
  </section>
</template>

<style scoped>
.after-sale-apply-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr) auto;
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 16px 20px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.status-text {
  margin: 0;
  padding: 20px 0;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
}

.type-card,
.goods-card,
.form-card,
.summary-card {
  margin-bottom: 12px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(26, 25, 24, 0.05);
}

.type-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
}

.type-button {
  height: 40px;
  border: 1px solid #efe5d9;
  border-radius: 999px;
  background: #fff8f2;
  color: #9c8e7f;
  font-size: 14px;
  font-weight: 600;
}

.type-button-active {
  border-color: #ea580c;
  background: #fff1e6;
  color: #c2410c;
}

.section-header {
  padding: 16px 16px 0;
}

.section-header strong {
  color: #1a1918;
  font-size: 15px;
  font-weight: 700;
}

.form-body {
  display: grid;
  gap: 18px;
  padding: 16px;
}

.field-block {
  display: grid;
  gap: 10px;
}

.field-label {
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 600;
}

.reason-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reason-chip {
  padding: 10px 14px;
  border: 0;
  border-radius: 999px;
  background: #f7f4ef;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
}

.reason-chip-active {
  background: #fff1e6;
  color: #c2410c;
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-button {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e4e1;
  border-radius: 999px;
  background: #fff;
  color: #3c3b39;
  font-size: 18px;
}

.quantity-value {
  min-width: 28px;
  text-align: center;
  color: #1a1918;
  font-size: 15px;
  font-weight: 700;
}

.quantity-row small {
  color: #9c9b99;
  font-size: 12px;
}

.description-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ece7df;
  border-radius: 14px;
  background: #faf7f2;
  color: #3c3b39;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
}

.summary-card {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-row span {
  color: #6d6c6a;
  font-size: 13px;
}

.summary-row strong {
  color: #3c3b39;
  font-size: 14px;
  font-weight: 600;
}

.summary-amount {
  color: #ea580c;
}

.action-footer {
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #eee7dc;
  background: rgba(255, 255, 255, 0.96);
}

.primary-button {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 999px;
  background: #ea580c;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
</style>
