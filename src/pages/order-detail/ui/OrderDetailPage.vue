<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { useBackendRuntime } from '@/app/providers/backend'
import { OrderProductRow, OrderStoreHeader } from '@/entities/order'
import ConfirmDialog from '@/shared/ui/ConfirmDialog.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useOrderDetailPageModel } from '../model/useOrderDetailPageModel'

function normalizeRouteParam(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function canUseAction(actions: { enabled: boolean; key: string }[], key: string) {
  return actions.some((action) => action.key === key && action.enabled)
}

const route = useRoute()
const router = useRouter()
const runtime = useBackendRuntime()
const {
  cancelOrder,
  confirmReceipt,
  errorMessage,
  isLoading,
  loadOrderDetailPage,
  orderDetailPageData,
} = useOrderDetailPageModel()

const orderId = computed(() => normalizeRouteParam(route.params.orderId))
const isInvoiceEnabled = computed(() => runtime.capabilities.invoice)
const isLogisticsEnabled = computed(() => runtime.capabilities.logistics)
const confirmReceiptDialogVisible = ref(false)
const isConfirmingReceipt = ref(false)

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member/orders')
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function resolveImage(imageUrl: string | null) {
  return imageUrl || undefined
}

function canApplyAfterSale(actions: { enabled: boolean; key: string }[]) {
  return canUseAction(actions, 'refund') || canUseAction(actions, 'return')
}

function canViewLogistics(actions: { enabled: boolean; key: string }[]) {
  return canUseAction(actions, 'view-logistics')
}

function resolveAfterSaleQueryType(actions: { enabled: boolean; key: string }[]) {
  return canUseAction(actions, 'return') ? 'return' : 'refund'
}

async function handleCancelOrder() {
  if (!orderDetailPageData.value) {
    return
  }

  try {
    await cancelOrder(orderDetailPageData.value.orderId)
    showSuccessToast('订单已取消')
  } catch {
    showFailToast('取消订单失败')
  }
}

async function handlePayOrder() {
  if (!orderDetailPageData.value) {
    return
  }

  void router.push({ name: 'checkout' })
}

async function handleConfirmReceipt() {
  if (!orderDetailPageData.value) {
    return
  }

  confirmReceiptDialogVisible.value = true
}

async function submitConfirmReceipt() {
  if (!orderDetailPageData.value || isConfirmingReceipt.value) {
    return
  }

  isConfirmingReceipt.value = true

  try {
    await confirmReceipt(orderDetailPageData.value.orderId)
    confirmReceiptDialogVisible.value = false
    showSuccessToast('已确认收货')
  } catch {
    showFailToast('确认收货失败')
  } finally {
    isConfirmingReceipt.value = false
  }
}

async function handleCopyOrderNo() {
  if (!orderDetailPageData.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(orderDetailPageData.value.orderNo)
    showSuccessToast('订单号已复制')
  } catch {
    showFailToast('复制失败')
  }
}

watch(
  orderId,
  (nextOrderId) => {
    if (!nextOrderId) {
      return
    }

    void loadOrderDetailPage(nextOrderId)
  },
  { immediate: true },
)

onMounted(() => {
  if (!orderId.value) {
    return
  }

  void loadOrderDetailPage(orderId.value)
})
</script>

<template>
  <section class="order-detail-page">
    <PageTopBar title="订单详情" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <LoadingState v-else-if="isLoading" />

      <EmptyState
        v-else-if="!orderDetailPageData"
        description="订单可能不存在，或当前账号没有访问权限。"
        description-width="240px"
        icon="description"
        layout="fill"
        title="未找到订单详情"
      />

      <template v-else>
        <section class="status-card">
          <div class="status-copy">
            <strong>{{ orderDetailPageData.statusText }}</strong>
            <p>{{ orderDetailPageData.statusHint }}</p>
          </div>

          <div v-if="isLogisticsEnabled && orderDetailPageData.logistics" class="logistics-summary">
            <span>{{ orderDetailPageData.logistics.title }}</span>
            <p>{{ orderDetailPageData.logistics.description }}</p>
            <small>最近更新：{{ orderDetailPageData.logistics.updatedAt }}</small>
          </div>

          <RouterLink
            v-else-if="isLogisticsEnabled && canViewLogistics(orderDetailPageData.actions)"
            class="logistics-empty-link"
            :to="{ name: 'member-order-logistics', params: { orderId: orderDetailPageData.orderId } }"
          >
            <span>物流详情暂未接入</span>
            <small>当前先保留空页面占位，后续可接真实物流轨迹。</small>
          </RouterLink>
        </section>

        <section class="address-card">
          <header class="card-header">
            <van-icon name="location-o" size="18" />
            <strong>收货信息</strong>
          </header>

          <div class="address-copy">
            <strong>{{ orderDetailPageData.address.recipientName }} {{ orderDetailPageData.address.recipientPhone }}</strong>
            <p>{{ orderDetailPageData.address.address }}</p>
          </div>
        </section>

        <section class="goods-card">
          <OrderStoreHeader
            :status-text="orderDetailPageData.statusText"
            :store-name="orderDetailPageData.storeName"
          />

          <div v-for="item in orderDetailPageData.items" :key="item.orderItemId" class="order-item-block">
            <OrderProductRow
              :image-alt="item.productName"
              :image-url="resolveImage(item.productImageUrl)"
              :price-text="formatAmount(item.unitPrice)"
              :product-name="item.productName"
              :quantity-text="`x${item.quantity}`"
              :to="item.productId ? { name: 'product-detail', params: { productId: item.productId } } : undefined"
            />

            <div v-if="item.afterSaleStatus || canApplyAfterSale(item.actions)" class="item-action-row">
              <span v-if="item.afterSaleStatus" class="item-after-sale-status">{{ item.afterSaleStatus }}</span>

              <RouterLink
                v-if="canApplyAfterSale(item.actions)"
                class="item-action-button"
                :to="item.afterSaleStatus
                  ? { name: 'member-after-sales' }
                  : {
                    name: 'member-after-sale-apply',
                    params: { orderId: orderDetailPageData.orderId, orderItemId: item.orderItemId },
                    query: { type: resolveAfterSaleQueryType(item.actions) },
                  }"
              >
                {{ item.afterSaleStatus ? '查看售后' : '申请售后' }}
              </RouterLink>
            </div>
          </div>

          <div v-if="orderDetailPageData.gifts.length > 0" class="gift-list">
            <div v-for="gift in orderDetailPageData.gifts" :key="gift.giftName" class="gift-row">
              <span>赠品：{{ gift.giftName }}</span>
              <small>x{{ gift.quantity }}</small>
            </div>
          </div>

          <div v-if="orderDetailPageData.promotions.length > 0" class="promotion-list">
            <div v-for="promotion in orderDetailPageData.promotions" :key="promotion.label + promotion.description" class="promotion-row">
              <span>{{ promotion.label }}</span>
              <p>{{ promotion.description }}</p>
            </div>
          </div>
        </section>

        <section class="amount-card">
          <header class="card-header">
            <van-icon name="balance-o" size="18" />
            <strong>金额明细</strong>
          </header>

          <div class="amount-list">
            <div v-for="item in orderDetailPageData.amountDetails" :key="item.code" class="amount-row">
              <span>{{ item.label }}</span>
              <strong :class="{ 'amount-decrease': item.direction === 'decrease' }">
                {{ item.direction === 'decrease' ? '-' : '' }}{{ formatAmount(item.amount) }}
              </strong>
            </div>
          </div>

          <div class="amount-total">
            <span>实付款</span>
            <strong>{{ formatAmount(orderDetailPageData.payableAmount) }}</strong>
          </div>
        </section>

        <section class="info-card">
          <header class="card-header">
            <van-icon name="notes-o" size="18" />
            <strong>订单信息</strong>
          </header>

          <div class="info-list">
            <div class="info-row">
              <span>订单编号</span>
              <strong>{{ orderDetailPageData.orderNo }}</strong>
            </div>
            <div class="info-row">
              <span>支付方式</span>
              <strong>{{ orderDetailPageData.paymentMethod ?? '待支付' }}</strong>
            </div>
            <div class="info-row">
              <span>买家留言</span>
              <strong>{{ orderDetailPageData.buyerMessage ?? '无' }}</strong>
            </div>
            <div class="info-row">
              <span>配送备注</span>
              <strong>{{ orderDetailPageData.deliveryRemark ?? '无' }}</strong>
            </div>
            <div v-if="isInvoiceEnabled" class="info-row">
              <span>发票信息</span>
              <strong>{{ orderDetailPageData.invoiceInfo ?? '未开票' }}</strong>
            </div>
            <div class="info-row">
              <span>下单时间</span>
              <strong>{{ orderDetailPageData.timeline.createdAt }}</strong>
            </div>
            <div v-if="orderDetailPageData.timeline.paidAt" class="info-row">
              <span>支付时间</span>
              <strong>{{ orderDetailPageData.timeline.paidAt }}</strong>
            </div>
            <div v-if="orderDetailPageData.timeline.shippedAt" class="info-row">
              <span>发货时间</span>
              <strong>{{ orderDetailPageData.timeline.shippedAt }}</strong>
            </div>
            <div v-if="orderDetailPageData.timeline.completedAt" class="info-row">
              <span>完成时间</span>
              <strong>{{ orderDetailPageData.timeline.completedAt }}</strong>
            </div>
          </div>
        </section>
      </template>
    </div>

    <footer v-if="orderDetailPageData" class="action-footer">
      <button
        v-if="canUseAction(orderDetailPageData.actions, 'copy-order-no')"
        class="ghost-button"
        type="button"
        @click="handleCopyOrderNo"
      >
        复制单号
      </button>

      <button
        v-if="canUseAction(orderDetailPageData.actions, 'cancel')"
        class="ghost-button"
        type="button"
        @click="handleCancelOrder"
      >
        取消订单
      </button>

      <button
        v-if="canUseAction(orderDetailPageData.actions, 'confirm-receipt')"
        class="primary-button"
        type="button"
        @click="handleConfirmReceipt"
      >
        确认收货
      </button>

      <button
        v-if="canUseAction(orderDetailPageData.actions, 'pay')"
        class="primary-button"
        type="button"
        @click="handlePayOrder"
      >
        余额支付
      </button>
    </footer>

    <ConfirmDialog
      v-model="confirmReceiptDialogVisible"
      cancel-text="取消"
      confirm-text="确认收货"
      :loading="isConfirmingReceipt"
      message="为保障售后权益，请检查后再确认收货"
      title="确认收到货了吗？"
      @confirm="submitConfirmReceipt"
    />
  </section>
</template>

<style scoped>
.order-detail-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr) auto;
  height: 100vh;
  height: 100dvh;
  background: #f7f4ef;
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

.status-card,
.address-card,
.goods-card,
.amount-card,
.info-card {
  display: grid;
  gap: 14px;
  margin-bottom: 12px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(26, 25, 24, 0.05);
}

.status-card {
  padding: 18px 16px;
  background: linear-gradient(135deg, #fff1e6 0%, #fff8f2 100%);
}

.status-copy {
  display: grid;
  gap: 8px;
}

.status-copy strong {
  color: #c2410c;
  font-size: 20px;
  font-weight: 700;
}

.status-copy p,
.logistics-summary p {
  margin: 0;
  color: #6d6c6a;
  font-size: 13px;
  line-height: 1.5;
}

.logistics-summary {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
}

.logistics-summary span,
.card-header strong {
  color: #1a1918;
  font-size: 15px;
  font-weight: 700;
}

.logistics-summary small,
.gift-row small {
  color: #9c9b99;
  font-size: 12px;
}

.card-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 16px 16px 0;
  color: #d97706;
}

.address-copy,
.amount-list,
.info-list {
  display: grid;
  gap: 12px;
  padding: 0 16px 16px;
}

.address-copy strong,
.amount-total strong,
.amount-row strong,
.info-row strong {
  color: #3c3b39;
  font-size: 14px;
  font-weight: 600;
}

.address-copy p {
  margin: 0;
  color: #6d6c6a;
  font-size: 13px;
  line-height: 1.5;
}

.gift-list,
.promotion-list {
  display: grid;
  gap: 10px;
  padding: 0 16px 16px;
}

.order-item-block + .order-item-block {
  border-top: 1px solid #f5f0ea;
}

.item-action-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 0 16px 14px;
}

.item-after-sale-status {
  color: #d97706;
  font-size: 12px;
  font-weight: 600;
}

.item-action-button {
  min-width: 84px;
  height: 30px;
  padding: 0 14px;
  border: 1px solid #efe0d0;
  border-radius: 999px;
  background: #fff8f2;
  color: #c2410c;
  font-size: 12px;
  font-weight: 600;
  line-height: 30px;
  text-align: center;
  text-decoration: none;
}

.gift-row,
.promotion-row,
.amount-row,
.amount-total,
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gift-row,
.promotion-row,
.amount-row,
.info-row {
  color: #6d6c6a;
  font-size: 13px;
}

.promotion-row p {
  margin: 0;
  color: #c2410c;
  text-align: right;
}

.amount-list {
  padding-bottom: 0;
}

.amount-total {
  padding: 16px;
  border-top: 1px solid #f2ede6;
}

.amount-total span {
  color: #6d6c6a;
  font-size: 14px;
}

.amount-total strong {
  color: #ea580c;
  font-size: 20px;
}

.amount-decrease {
  color: #ea580c;
}

.info-row span {
  flex: 0 0 72px;
  color: #9c9b99;
}

.info-row strong {
  text-align: right;
}

.action-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #eee7dc;
  background: rgba(255, 255, 255, 0.96);
}

.ghost-button,
.primary-button {
  min-width: 96px;
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.ghost-button {
  border: 1px solid #e5e4e1;
  background: #fff;
  color: #6d6c6a;
}

.primary-button {
  border: 0;
  background: #ea580c;
  color: #fff;
}
</style>
