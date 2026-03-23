<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from 'vant'

import ProductMediaRow from '@/shared/ui/ProductMediaRow.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useReturnDetailPageModel } from '../model/useReturnDetailPageModel'

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
const {
  cancelReturnApplication,
  errorMessage,
  isLoading,
  loadReturnDetailPage,
  returnDetailPageData,
} = useReturnDetailPageModel()

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

function resolveImage(imageUrl: string | null) {
  return imageUrl || undefined
}

function handlePendingAction(message: string) {
  showToast(message)
}

function callMerchant(phone: string | null) {
  if (!phone) {
    showToast('商家电话暂未提供')
    return
  }

  window.location.href = `tel:${phone}`
}

function goToReturnShipmentPage() {
  if (!refundId.value) {
    return
  }

  void router.push({
    name: 'member-return-shipment',
    params: {
      refundId: refundId.value,
    },
  })
}

async function handleCancelApplication() {
  if (!refundId.value) {
    return
  }

  try {
    await showConfirmDialog({
      title: '取消退货申请',
      message: '取消后将关闭当前退货申请，当前仅保留前端演示状态。',
    })
  } catch {
    return
  }

  const result = await cancelReturnApplication(refundId.value)

  if (!result) {
    showFailToast('取消申请失败')
    return
  }

  await loadReturnDetailPage(refundId.value)
  showSuccessToast('退货申请已取消')
}

watch(
  refundId,
  (nextRefundId) => {
    if (!nextRefundId) {
      return
    }

    void loadReturnDetailPage(nextRefundId)
  },
  { immediate: true },
)

onMounted(() => {
  if (!refundId.value) {
    return
  }

  void loadReturnDetailPage(refundId.value)
})
</script>

<template>
  <section class="return-detail-page">
    <PageTopBar title="退货详情" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <p v-else-if="isLoading" class="status-text">
        退货详情加载中...
      </p>

      <EmptyState
        v-else-if="!returnDetailPageData"
        description="当前退货记录不存在，或详情数据还未补充。"
        description-width="240px"
        icon="records"
        layout="fill"
        title="未找到退货详情"
      />

      <template v-else>
        <section class="status-card">
          <strong>{{ returnDetailPageData.statusText }}</strong>
          <p>退货原因：{{ returnDetailPageData.reason }}</p>
          <span>售后单号：{{ returnDetailPageData.refundId }}</span>
        </section>

        <section class="detail-card">
          <header class="card-header">
            <van-icon name="shop-o" size="18" />
            <strong>商品信息</strong>
          </header>

          <ProductMediaRow
            :image-alt="returnDetailPageData.productName"
            :image-url="resolveImage(returnDetailPageData.productImageUrl)"
            :meta-text="returnDetailPageData.skuDescription ?? undefined"
            :price-text="formatAmount(returnDetailPageData.unitPrice)"
            :title="returnDetailPageData.productName"
            :trailing-text="`购买 ${returnDetailPageData.quantity} 件 / 退回 ${returnDetailPageData.returnQuantity} 件`"
          />
        </section>

        <section class="detail-card">
          <header class="card-header">
            <van-icon name="todo-list-o" size="18" />
            <strong>申请信息</strong>
          </header>

          <div class="info-list">
            <div class="info-row">
              <span>订单编号</span>
              <strong>{{ returnDetailPageData.orderId }}</strong>
            </div>
            <div class="info-row">
              <span>申请时间</span>
              <strong>{{ returnDetailPageData.appliedAt }}</strong>
            </div>
            <div class="info-row">
              <span>退款金额</span>
              <strong class="refund-amount">{{ formatAmount(returnDetailPageData.refundAmount) }}</strong>
            </div>
            <div class="info-row">
              <span>问题描述</span>
              <strong>{{ returnDetailPageData.description ?? '无补充说明' }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <header class="card-header">
            <van-icon name="location-o" size="18" />
            <strong>退货地址</strong>
          </header>

          <div class="info-list">
            <div class="address-block">
              <strong>{{ returnDetailPageData.merchantAddress.recipientName }} {{ returnDetailPageData.merchantAddress.recipientPhone }}</strong>
              <p>{{ returnDetailPageData.merchantAddress.address }}</p>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <header class="card-header">
            <van-icon name="logistics" size="18" />
            <strong>退货物流</strong>
          </header>

          <div v-if="returnDetailPageData.returnShipment" class="info-list">
            <div class="info-row">
              <span>物流公司</span>
              <strong>{{ returnDetailPageData.returnShipment.company }}</strong>
            </div>
            <div class="info-row">
              <span>运单号</span>
              <strong>{{ returnDetailPageData.returnShipment.trackingNo }}</strong>
            </div>
            <div class="info-row">
              <span>发货时间</span>
              <strong>{{ returnDetailPageData.returnShipment.shippedAt ?? '待录入' }}</strong>
            </div>
          </div>

          <div v-else class="info-list">
            <p class="empty-copy">商家已通过退货申请，等待买家填写回寄物流信息。</p>
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
              <strong>{{ returnDetailPageData.amountDetail.paymentMethod }}</strong>
            </div>
            <div class="info-row">
              <span>原路退回</span>
              <strong>{{ formatAmount(returnDetailPageData.amountDetail.onlineRefundAmount) }}</strong>
            </div>
            <div class="info-row">
              <span>预存款退回</span>
              <strong>{{ formatAmount(returnDetailPageData.amountDetail.predepositRefundAmount) }}</strong>
            </div>
            <div class="info-row">
              <span>充值卡退回</span>
              <strong>{{ formatAmount(returnDetailPageData.amountDetail.rechargeCardRefundAmount) }}</strong>
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
              <span>{{ returnDetailPageData.merchantProcess.status }}</span>
              <p>{{ returnDetailPageData.merchantProcess.remark ?? '暂无备注' }}</p>
            </div>

            <div class="process-row">
              <strong>平台处理</strong>
              <span>{{ returnDetailPageData.platformProcess.status }}</span>
              <p>{{ returnDetailPageData.platformProcess.remark ?? '暂无备注' }}</p>
            </div>
          </div>
        </section>
      </template>
    </div>

    <footer v-if="returnDetailPageData" class="action-footer">
      <button
        v-if="canUseAction(returnDetailPageData.actions, 'cancel')"
        class="ghost-button"
        type="button"
        @click="handleCancelApplication"
      >
        取消申请
      </button>

      <button
        class="ghost-button"
        type="button"
        @click="callMerchant(returnDetailPageData.merchantPhone)"
      >
        电话联系商家
      </button>

      <button
        v-if="canUseAction(returnDetailPageData.actions, 'delay')"
        class="ghost-button"
        type="button"
        @click="handlePendingAction('已为该退货申请延长处理时效')"
      >
        延长处理
      </button>

      <button
        v-if="canUseAction(returnDetailPageData.actions, 'ship-return')"
        class="primary-button"
        type="button"
        @click="goToReturnShipmentPage"
      >
        {{ returnDetailPageData.returnShipment ? '修改物流' : '去寄回' }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.return-detail-page {
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
.process-row p,
.address-block p,
.empty-copy {
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
.process-row strong,
.address-block strong {
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

.action-footer {
  display: flex;
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
