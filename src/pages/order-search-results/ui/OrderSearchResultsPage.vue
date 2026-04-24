<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { OrderProductRow, OrderStoreHeader } from '@/entities/order'
import { backendTarget } from '@/shared/config/backend'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useOrderSearchResultsPageModel } from '../model/useOrderSearchResultsPageModel'

const router = useRouter()
const {
  cancelOrder,
  confirmReceipt,
  errorMessage,
  isLoading,
  keyword,
  loadOrderListPage,
  results,
  submitSearch,
} = useOrderSearchResultsPageModel()
const supportsOrderCancelAndPay = backendTarget === 'mock'
const supportsOrderConfirmReceipt = backendTarget === 'mock' || backendTarget === 'backend-a'

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member-orders' })
}

function handleSubmit() {
  void submitSearch()
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function getItemCount(orderItemCount: number, quantities: number[]) {
  const quantityTotal = quantities.reduce((sum, quantity) => sum + quantity, 0)
  return Math.max(orderItemCount, quantityTotal)
}

function resolveImage(imageUrl: string | null) {
  return imageUrl || undefined
}

async function handleCancelOrder(orderId: string) {
  try {
    await cancelOrder(orderId)
    await loadOrderListPage()
    showSuccessToast('订单已取消')
  } catch {
    showFailToast('取消订单失败')
  }
}

async function handleConfirmReceipt(orderId: string) {
  try {
    await confirmReceipt(orderId)
    await loadOrderListPage()
    showSuccessToast('已确认收货')
  } catch {
    showFailToast('确认收货失败')
  }
}

onMounted(() => {
  void loadOrderListPage()
})

onActivated(() => {
  void loadOrderListPage()
})
</script>

<template>
  <section class="order-search-results-page">
    <header class="search-header">
      <button class="header-button" type="button" aria-label="返回上一页" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>

      <SearchField
        v-model="keyword"
        class="search-box"
        aria-label="搜索全部订单"
        placeholder="搜索商品标题、店铺名或订单号"
        :icon-size="16"
        variant="soft"
        @submit="handleSubmit"
      />

      <button class="search-submit" type="button" @click="handleSubmit">搜索</button>
    </header>

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <LoadingState v-else-if="isLoading" />

      <template v-else-if="results.length > 0">
        <div class="summary-row">
          <strong>共找到 {{ results.length }} 笔相关订单</strong>
          <span>关键词：{{ keyword }}</span>
        </div>

        <div class="order-list">
          <section v-for="order in results" :key="order.orderId" class="store-section">
            <OrderStoreHeader :status-text="order.statusText" :store-name="order.storeName" />

            <OrderProductRow
              v-for="item in order.items"
              :key="item.orderItemId"
              :image-alt="item.productName"
              :image-url="resolveImage(item.productImageUrl)"
              :price-text="formatAmount(item.unitPrice)"
              :product-name="item.productName"
              :quantity-text="`x${item.quantity}`"
              :to="{ name: 'product-detail', params: { productId: item.productId } }"
            />

            <footer class="store-footer store-footer-actions">
              <div class="total-row">
                <span>共{{ getItemCount(order.itemCount, order.items.map((item) => item.quantity)) }}件商品，合计：</span>
                <i class="coin-dot coin-dot-small" />
                <strong>{{ formatAmount(order.totalAmount) }}</strong>
                <span v-if="order.shippingAmount >= 0" class="shipping-text">（含运费 {{ formatAmount(order.shippingAmount) }}）</span>
              </div>

              <div class="action-row">
                <RouterLink class="ghost-button ghost-link-button" :to="{ name: 'member-order-detail', params: { orderId: order.orderId } }">
                  订单详情
                </RouterLink>

                <template v-if="supportsOrderCancelAndPay && order.status === 'pending-payment'">
                  <button class="ghost-button" type="button" @click="handleCancelOrder(order.orderId)">取消订单</button>
                  <RouterLink class="primary-button primary-link-button" :to="{ name: 'checkout' }">余额支付</RouterLink>
                </template>

                <button
                  v-else-if="supportsOrderConfirmReceipt && order.status === 'pending-receipt'"
                  class="primary-button"
                  type="button"
                  @click="handleConfirmReceipt(order.orderId)"
                >
                  确认收货
                </button>
              </div>
            </footer>
          </section>
        </div>
      </template>

      <section v-else class="empty-wrap">
        <EmptyState
          :description="keyword ? '没有找到相关订单，换个订单号、商品名或店铺名试试。' : '输入关键词后可在全部订单中统一搜索。'"
          description-width="240px"
          icon="search"
          :title="keyword ? '没有找到相关订单' : '搜索全部订单'"
        />
      </section>
    </div>
  </section>
</template>

<style scoped>
.order-search-results-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
  background: #f7f4ef;
}

.search-header {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #ede9e3;
}

.header-button,
.search-submit {
  padding: 0;
  border: 0;
  background: transparent;
}

.header-button {
  color: #3c3b39;
}

.search-box {
  min-width: 0;
}

.search-submit {
  color: #d89575;
  font-size: 13px;
  font-weight: 600;
}

.content-scroll {
  min-height: 0;
  padding: 16px 0 20px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.status-text {
  margin: 0;
  padding: 20px 16px;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 14px;
  color: #6d6c6a;
  font-size: 13px;
}

.summary-row strong {
  color: #1a1918;
  font-size: 15px;
}

.order-list {
  display: grid;
  gap: 12px;
}

.store-section {
  display: grid;
  background: #fff;
}

.coin-dot-small {
  width: 12px;
  height: 12px;
}

.store-footer {
  display: grid;
  gap: 12px;
  padding: 0 16px 16px;
  background: #fff;
}

.store-footer-actions {
  grid-template-columns: 1fr;
}

.total-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  align-items: center;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
}

.total-row strong {
  color: #ea580c;
  font-size: 18px;
  font-weight: 700;
}

.shipping-text {
  font-size: 12px;
}

.action-row {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.ghost-button {
  min-width: 92px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #e5e4e1;
  border-radius: 8px;
  background: #fff;
  color: #9c9b99;
  font-size: 13px;
  font-weight: 500;
}

.ghost-link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.primary-button {
  min-width: 92px;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.primary-link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.empty-wrap {
  display: grid;
  padding: 48px 16px 0;
}
</style>
