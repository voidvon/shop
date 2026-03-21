<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { OrderProductRow, OrderStoreHeader } from '@/entities/order'
import { mockImageUrl, mockTradeData } from '@/shared/mocks'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import SearchField from '@/shared/ui/SearchField.vue'
import type { TradeOrderStatus } from '@/shared/types/modules'

const route = useRoute()
const router = useRouter()

const orderCenterPageData = mockTradeData.orderCenterPageData
const keyword = ref(typeof route.query.keyword === 'string' ? route.query.keyword : orderCenterPageData.query.keyword)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending-payment', label: '待付款' },
  { key: 'pending-shipment', label: '待发货' },
  { key: 'pending-receipt', label: '待收货' },
  { key: 'pending-review', label: '待评价' },
] as const

const validStatuses = new Set<TradeOrderStatus>(tabs.map((tab) => tab.key))

const activeStatus = computed<TradeOrderStatus>(() => {
  const status = route.query.status
  return typeof status === 'string' && validStatuses.has(status as TradeOrderStatus)
    ? (status as TradeOrderStatus)
    : 'all'
})

const filteredOrders = computed(() => {
  const normalizedKeyword = keyword.value.trim()

  return orderCenterPageData.orderPage.list.filter((order) => {
    const matchesStatus = activeStatus.value === 'all' || order.status === activeStatus.value

    if (!matchesStatus) {
      return false
    }

    if (!normalizedKeyword) {
      return true
    }

    return [order.orderNo, order.storeName, ...order.items.map((item) => item.productName)].some((field) =>
      field.toLowerCase().includes(normalizedKeyword.toLowerCase()),
    )
  })
})

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

function changeStatus(status: TradeOrderStatus) {
  void router.replace({
    name: 'member-orders',
    query: status === 'all' ? undefined : { status },
  })
}

function submitSearch() {
  keyword.value = keyword.value.trim()
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function getItemCount(orderItemCount: number, quantities: number[]) {
  const quantityTotal = quantities.reduce((sum, quantity) => sum + quantity, 0)
  return Math.max(orderItemCount, quantityTotal)
}

function resolveImage(imageUrl: string) {
  return imageUrl === mockImageUrl ? '' : imageUrl
}
</script>

<template>
  <section class="order-list-page">
    <PageTopBar title="泉州文惠卡" right-icon="ellipsis" @back="goBack" />

    <div class="search-row">
      <SearchField
        v-model="keyword"
        class="search-box"
        aria-label="搜索订单"
        :icon-size="16"
        placeholder="输入商品标题或订单号进行搜索"
        variant="soft"
        @change="submitSearch"
      />

      <button class="type-filter" type="button">
        <span>实物</span>
        <van-icon name="arrow-down" size="14" />
      </button>
    </div>

    <nav class="tabs-row" aria-label="订单状态筛选">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="status-tab"
        :class="{ 'status-tab-active': activeStatus === tab.key }"
        type="button"
        @click="changeStatus(tab.key)"
      >
        <span>{{ tab.label }}</span>
        <i class="status-tab-line" />
      </button>
    </nav>

    <div class="order-scroll">
      <div v-if="filteredOrders.length > 0" class="order-list">
        <section v-for="order in filteredOrders" :key="order.orderId" class="store-section">
          <OrderStoreHeader :status-text="order.statusText" :store-name="order.storeName" />

          <OrderProductRow
            v-for="item in order.items"
            :key="item.orderItemId"
            :image-alt="item.productName"
            :image-url="resolveImage(item.productImageUrl)"
            :price-text="formatAmount(item.unitPrice)"
            :product-name="item.productName"
            :quantity-text="`x${item.quantity}`"
          />

          <footer class="store-footer" :class="{ 'store-footer-actions': order.status === 'pending-payment' }">
            <div class="total-row">
              <span>共{{ getItemCount(order.itemCount, order.items.map((item) => item.quantity)) }}件商品，合计：</span>
              <i class="coin-dot coin-dot-small" />
              <strong>{{ formatAmount(order.totalAmount) }}</strong>
              <span v-if="order.shippingAmount >= 0" class="shipping-text">（含运费 {{ formatAmount(order.shippingAmount) }}）</span>
            </div>

            <div v-if="order.status === 'pending-payment'" class="action-row">
              <button class="ghost-button" type="button">取消订单</button>
            </div>
          </footer>
        </section>
      </div>

      <EmptyState
        v-else
        class="empty-state"
        description="切换状态或搜索其他订单试试"
        icon="description"
        title="当前没有订单内容"
      />
    </div>
  </section>
</template>

<style scoped>
.order-list-page {
  display: grid;
  grid-template-rows: 56px 52px 46px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
}

.search-box {
  flex: 1;
}

.type-filter {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #d89575;
  font-size: 13px;
  font-weight: 600;
}

.tabs-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  height: 46px;
  border-bottom: 1px solid #ede9e3;
  background: #fff;
}

.status-tab {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3c3b39;
  font-size: 14px;
  font-weight: 500;
}

.status-tab-line {
  width: 28px;
  height: 2px;
  background: transparent;
}

.status-tab-active {
  color: #ea580c;
  font-weight: 700;
}

.status-tab-active .status-tab-line {
  background: #ea580c;
}

.order-scroll {
  min-height: 0;
  overflow-y: auto;
  padding: 12px 0 20px;
  scrollbar-width: none;
}

.order-scroll::-webkit-scrollbar {
  display: none;
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

.empty-state {
  min-height: 100%;
}
</style>
