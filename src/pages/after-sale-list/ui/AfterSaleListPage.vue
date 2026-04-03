<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

import ProductMediaRow from '@/shared/ui/ProductMediaRow.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useAfterSaleListPageModel } from '../model/useAfterSaleListPageModel'

const router = useRouter()
const {
  afterSaleListPageData,
  errorMessage,
  isLoading,
  loadAfterSaleListPage,
} = useAfterSaleListPageModel()

const activeTab = ref<'refund' | 'return'>('refund')

const currentRecords = computed(() => {
  if (!afterSaleListPageData.value) {
    return []
  }

  return activeTab.value === 'refund'
    ? afterSaleListPageData.value.refundPage.list
    : afterSaleListPageData.value.returnPage.list
})

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function resolveImage(imageUrl: string | null) {
  return imageUrl || undefined
}

function handleDetail(recordId: string) {
  void router.push({
    name: activeTab.value === 'refund' ? 'member-refund-detail' : 'member-return-detail',
    params: {
      refundId: recordId,
    },
  })
}

function handlePendingAction() {
  showToast('该操作暂保留在前端演示')
}

onMounted(() => {
  void loadAfterSaleListPage()
})
</script>

<template>
  <section class="after-sale-page">
    <PageTopBar title="售后服务" @back="goBack" />

    <van-tabs v-model:active="activeTab" class="after-sale-tabs">
      <van-tab name="refund" title="退款申请" />
      <van-tab name="return" title="退货申请" />
    </van-tabs>

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <LoadingState v-else-if="isLoading" />

      <EmptyState
        v-else-if="currentRecords.length === 0"
        description="当前没有售后记录，完成支付后的订单可以继续申请退款或退货。"
        description-width="240px"
        icon="records"
        layout="fill"
        title="暂无售后记录"
      />

      <div v-else class="record-list">
        <article v-for="record in currentRecords" :key="record.refundId" class="record-card">
          <header class="record-header">
            <div class="store-wrap">
              <van-icon name="shop-o" size="18" />
              <strong>{{ record.storeName }}</strong>
            </div>

            <span>{{ record.statusText }}</span>
          </header>

          <ProductMediaRow
            :image-alt="record.productName"
            :image-url="resolveImage(record.productImageUrl)"
            :meta-text="record.skuDescription ?? undefined"
            :price-text="formatAmount(record.unitPrice)"
            :title="record.productName"
            :trailing-text="`x${record.quantity}`"
          />

          <div class="meta-list">
            <div class="meta-row">
              <span>申请时间</span>
              <strong>{{ record.appliedAt }}</strong>
            </div>
            <div class="meta-row">
              <span>退款金额</span>
              <strong class="refund-amount">{{ formatAmount(record.refundAmount) }}</strong>
            </div>
          </div>

          <footer class="action-row">
            <button
              v-for="action in record.actions"
              :key="action.key"
              class="ghost-button"
              type="button"
              @click="action.key === 'view-detail' ? handleDetail(record.refundId) : handlePendingAction()"
            >
              {{ action.key === 'view-detail' ? '查看详情' : action.key === 'delay' ? '延长处理' : '去寄回' }}
            </button>
          </footer>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.after-sale-page {
  display: grid;
  grid-template-rows: 49px 44px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.after-sale-tabs {
  background: #fff;
}

.after-sale-tabs :deep(.van-tabs__wrap) {
  border-bottom: 1px solid #eee7dc;
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

.record-list {
  display: grid;
  gap: 12px;
}

.record-card {
  display: grid;
  gap: 14px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(26, 25, 24, 0.05);
}

.record-header,
.meta-row,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.record-header {
  padding: 16px 16px 0;
}

.store-wrap {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #d89575;
}

.store-wrap strong {
  color: #3c3b39;
  font-size: 15px;
  font-weight: 600;
}

.record-header span {
  color: #d89575;
  font-size: 13px;
  font-weight: 600;
}

.meta-list {
  display: grid;
  gap: 10px;
  padding: 0 16px;
}

.meta-row span {
  color: #9c9b99;
  font-size: 12px;
}

.meta-row strong {
  color: #3c3b39;
  font-size: 13px;
  font-weight: 600;
}

.refund-amount {
  color: #ea580c;
}

.action-row {
  justify-content: flex-end;
  padding: 0 16px 16px;
}

.ghost-button {
  min-width: 88px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e5e4e1;
  border-radius: 999px;
  background: #fff;
  color: #6d6c6a;
  font-size: 12px;
  font-weight: 500;
}
</style>
