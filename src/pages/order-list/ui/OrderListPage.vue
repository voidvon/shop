<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { OrderProductRow, OrderStoreHeader } from '@/entities/order'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useOrderListPageModel } from '../model/useOrderListPageModel'

type OrderListFilterStatus =
  | 'all'
  | 'pending-payment'
  | 'pending-shipment'
  | 'pending-receipt'
  | 'pending-review'
  | 'after-sale'

const TAB_HIDE_DELAY_MS = 260

const route = useRoute()
const router = useRouter()
const { loadOrderListPage, orderListPageData } = useOrderListPageModel()

const keyword = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending-payment', label: '待付款' },
  { key: 'pending-shipment', label: '待发货' },
  { key: 'pending-receipt', label: '待收货' },
  { key: 'pending-review', label: '待评价' },
  { key: 'after-sale', label: '退款/退货' },
] as const

const validStatuses = new Set<OrderListFilterStatus>(tabs.map((tab) => tab.key))

function resolveRouteStatus(status: unknown): OrderListFilterStatus {
  return typeof status === 'string' && validStatuses.has(status as OrderListFilterStatus)
    ? (status as OrderListFilterStatus)
    : 'all'
}

const activeTab = ref<OrderListFilterStatus>(resolveRouteStatus(route.query.status))
const retainedPanels = ref<Set<OrderListFilterStatus>>(new Set([activeTab.value]))
const hideTimers = new Map<OrderListFilterStatus, ReturnType<typeof setTimeout>>()

function getFilteredOrders(status: OrderListFilterStatus) {
  const normalizedKeyword = keyword.value.trim()

  return orderListPageData.value.orders.filter((order) => {
    const matchesStatus = status === 'all'
      || (status === 'after-sale'
        ? order.status === 'refunding' || order.status === 'returning'
        : order.status === status)

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
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

function changeStatus(status: OrderListFilterStatus) {
  transitionToStatus(status)
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

function resolveImage(imageUrl: string | null) {
  return imageUrl || undefined
}

function retainPanel(status: OrderListFilterStatus) {
  const existingTimer = hideTimers.get(status)
  if (existingTimer) {
    clearTimeout(existingTimer)
    hideTimers.delete(status)
  }

  const nextPanels = new Set(retainedPanels.value)
  nextPanels.add(status)
  retainedPanels.value = nextPanels
}

function hidePanelLater(status: OrderListFilterStatus) {
  if (status === activeTab.value) {
    return
  }

  const existingTimer = hideTimers.get(status)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  hideTimers.set(status, setTimeout(() => {
    if (status === activeTab.value) {
      hideTimers.delete(status)
      return
    }

    const nextPanels = new Set(retainedPanels.value)
    nextPanels.delete(status)
    retainedPanels.value = nextPanels
    hideTimers.delete(status)
  }, TAB_HIDE_DELAY_MS))
}

function transitionToStatus(status: OrderListFilterStatus) {
  if (status === activeTab.value) {
    retainPanel(status)
    return
  }

  const previousStatus = activeTab.value
  activeTab.value = status
  retainPanel(status)
  hidePanelLater(previousStatus)
}

function shouldRenderPanel(status: OrderListFilterStatus) {
  return retainedPanels.value.has(status)
}

watch(
  () => route.query.status,
  (status) => {
    transitionToStatus(resolveRouteStatus(status))
  },
  { immediate: true },
)

watch(
  () => orderListPageData.value.keyword,
  (value) => {
    if (typeof route.query.keyword !== 'string' && !keyword.value) {
      keyword.value = value
    }
  },
  { immediate: true },
)

onMounted(() => {
  void loadOrderListPage()
})

onBeforeUnmount(() => {
  hideTimers.forEach((timer) => {
    clearTimeout(timer)
  })
  hideTimers.clear()
})
</script>

<template>
  <section class="order-list-page">
    <PageTopBar title="我的订单" right-icon="ellipsis" @back="goBack" />

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

    <van-tabs v-model:active="activeTab" class="tabs-row" animated swipeable @change="changeStatus">
      <van-tab
        v-for="tab in tabs"
        :key="tab.key"
        :name="tab.key"
        :title="tab.label"
      >
        <div v-if="shouldRenderPanel(tab.key)" class="order-scroll">
          <div v-show="getFilteredOrders(tab.key).length > 0" class="order-list">
            <section v-for="order in getFilteredOrders(tab.key)" :key="order.orderId" class="store-section">
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
            v-show="getFilteredOrders(tab.key).length === 0"
            description="切换状态或搜索其他订单试试"
            icon="description"
            layout="fill"
            title="当前没有订单内容"
          />
        </div>
      </van-tab>
    </van-tabs>
  </section>
</template>

<style scoped>
.order-list-page {
  display: grid;
  grid-template-rows: 56px 52px minmax(0, 1fr);
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
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  width: 100%;
  background: #fff;
  overflow: hidden;
}

.tabs-row :deep(.van-tabs__wrap) {
  border-bottom: 1px solid #ede9e3;
}

.tabs-row :deep(.van-tabs__content) {
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.tabs-row :deep(.van-tabs__content--animated) {
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.tabs-row :deep(.van-tabs__track) {
  height: 100%;
  min-width: 0;
}

.tabs-row :deep(.van-tab__panel-wrapper) {
  height: 100%;
}

.tabs-row :deep(.van-tab__panel-wrapper--inactive) {
  height: 100%;
  overflow: hidden;
}

.tabs-row :deep(.van-tab__panel) {
  height: 100%;
}

.order-scroll {
  height: 100%;
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

</style>
