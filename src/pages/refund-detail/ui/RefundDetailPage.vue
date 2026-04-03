<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from 'vant'

import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useRefundDetailPageModel } from '../model/useRefundDetailPageModel'

function normalizeRouteParam(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

const route = useRoute()
const router = useRouter()
const {
  cancelRefundApplication,
  errorMessage,
  isLoading,
  loadRefundDetailPage,
  refundDetailPageData,
} = useRefundDetailPageModel()

const refundId = computed(() => normalizeRouteParam(route.params.refundId))

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member/after-sales')
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function callMerchant(phone: string | null) {
  if (!phone) {
    showToast('商家电话暂未提供')
    return
  }

  window.location.href = `tel:${phone}`
}

function canUseAction(actions: { enabled: boolean; key: string }[], key: string) {
  return actions.some((action) => action.key === key && action.enabled)
}

async function handleCancelApplication() {
  if (!refundId.value) {
    return
  }

  try {
    await showConfirmDialog({
      title: '取消退款申请',
      message: '取消后将关闭当前退款申请，当前仅保留前端演示状态。',
    })
  } catch {
    return
  }

  const result = await cancelRefundApplication(refundId.value)

  if (!result) {
    showFailToast('取消申请失败')
    return
  }

  await loadRefundDetailPage(refundId.value)
  showSuccessToast('退款申请已取消')
}

watch(
  refundId,
  (nextRefundId) => {
    if (!nextRefundId) {
      return
    }

    void loadRefundDetailPage(nextRefundId)
  },
  { immediate: true },
)

onMounted(() => {
  if (!refundId.value) {
    return
  }

  void loadRefundDetailPage(refundId.value)
})
</script>

<template>
  <section class="refund-detail-page">
    <PageTopBar title="退款详情" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <LoadingState v-else-if="isLoading" />

      <EmptyState
        v-else-if="!refundDetailPageData"
        description="当前退款记录不存在，或详情数据还未补充。"
        description-width="240px"
        icon="records"
        layout="fill"
        title="未找到退款详情"
      />

      <template v-else>
        <section class="status-card">
          <strong>{{ refundDetailPageData.statusText }}</strong>
          <p>退款原因：{{ refundDetailPageData.reason }}</p>
          <span>退款单号：{{ refundDetailPageData.refundId }}</span>
        </section>

        <section class="detail-card">
          <header class="card-header">
            <van-icon name="todo-list-o" size="18" />
            <strong>申请信息</strong>
          </header>

          <div class="info-list">
            <div class="info-row">
              <span>订单编号</span>
              <strong>{{ refundDetailPageData.orderId }}</strong>
            </div>
            <div class="info-row">
              <span>退款金额</span>
              <strong class="refund-amount">{{ formatAmount(refundDetailPageData.refundAmount) }}</strong>
            </div>
            <div class="info-row">
              <span>问题描述</span>
              <strong>{{ refundDetailPageData.description ?? '无补充说明' }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <header class="card-header">
            <van-icon name="balance-o" size="18" />
            <strong>退款金额明细</strong>
          </header>

          <div class="info-list">
            <div class="info-row">
              <span>原支付方式</span>
              <strong>{{ refundDetailPageData.amountDetail.paymentMethod }}</strong>
            </div>
            <div class="info-row">
              <span>原路退回</span>
              <strong>{{ formatAmount(refundDetailPageData.amountDetail.onlineRefundAmount) }}</strong>
            </div>
            <div class="info-row">
              <span>预存款退回</span>
              <strong>{{ formatAmount(refundDetailPageData.amountDetail.predepositRefundAmount) }}</strong>
            </div>
            <div class="info-row">
              <span>充值卡退回</span>
              <strong>{{ formatAmount(refundDetailPageData.amountDetail.rechargeCardRefundAmount) }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <header class="card-header">
            <van-icon name="chat-o" size="18" />
            <strong>处理进度</strong>
          </header>

          <div class="process-list">
            <div class="process-row">
              <strong>商家处理</strong>
              <span>{{ refundDetailPageData.merchantProcess.status }}</span>
              <p>{{ refundDetailPageData.merchantProcess.remark ?? '暂无备注' }}</p>
            </div>

            <div class="process-row">
              <strong>平台处理</strong>
              <span>{{ refundDetailPageData.platformProcess.status }}</span>
              <p>{{ refundDetailPageData.platformProcess.remark ?? '暂无备注' }}</p>
            </div>
          </div>
        </section>

        <section v-if="refundDetailPageData.evidenceImages.length > 0" class="detail-card">
          <header class="card-header">
            <van-icon name="photo-o" size="18" />
            <strong>凭证图片</strong>
          </header>

          <div class="evidence-grid">
            <img
              v-for="item in refundDetailPageData.evidenceImages"
              :key="item.imageUrl"
              :src="item.imageUrl"
              alt="退款凭证"
            >
          </div>
        </section>
      </template>
    </div>

    <footer v-if="refundDetailPageData" class="action-footer">
      <button
        v-if="canUseAction(refundDetailPageData.actions, 'cancel')"
        class="ghost-button"
        type="button"
        @click="handleCancelApplication"
      >
        取消申请
      </button>

      <button class="ghost-button" type="button" @click="callMerchant(refundDetailPageData.merchantPhone)">
        电话联系商家
      </button>
    </footer>
  </section>
</template>

<style scoped>
.refund-detail-page {
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

.status-card,
.detail-card {
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

.status-card strong {
  color: #c2410c;
  font-size: 20px;
  font-weight: 700;
}

.status-card p,
.status-card span,
.process-row p {
  margin: 0;
  color: #6d6c6a;
  font-size: 13px;
  line-height: 1.5;
}

.card-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 16px 16px 0;
  color: #d97706;
}

.card-header strong,
.process-row strong {
  color: #1a1918;
  font-size: 15px;
  font-weight: 700;
}

.info-list,
.process-list {
  display: grid;
  gap: 12px;
  padding: 0 16px 16px;
}

.info-row,
.process-row {
  display: grid;
  gap: 6px;
}

.info-row {
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
}

.info-row span {
  color: #9c9b99;
  font-size: 12px;
}

.info-row strong,
.process-row span {
  color: #3c3b39;
  font-size: 13px;
  font-weight: 600;
}

.refund-amount {
  color: #ea580c;
}

.process-row {
  padding: 12px;
  border-radius: 14px;
  background: #faf7f2;
}

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 0 16px 16px;
}

.evidence-grid img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  object-fit: cover;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #eee7dc;
  background: rgba(255, 255, 255, 0.96);
}

.ghost-button {
  min-width: 110px;
  height: 36px;
  padding: 0 16px;
  border: 1px solid #e5e4e1;
  border-radius: 999px;
  background: #fff;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 600;
}
</style>
