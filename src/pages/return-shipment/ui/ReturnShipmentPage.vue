<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'

import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useReturnShipmentPageModel } from '../model/useReturnShipmentPageModel'

function normalizeRouteParam(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function createCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  const hours = `${now.getHours()}`.padStart(2, '0')
  const minutes = `${now.getMinutes()}`.padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDateTime(value: string) {
  return value.replace('T', ' ')
}

const route = useRoute()
const router = useRouter()
const {
  errorMessage,
  isLoading,
  loadReturnShipmentPage,
  readShipmentDraft,
  returnDetailPageData,
  submitShipment,
} = useReturnShipmentPageModel()

const refundId = ref(normalizeRouteParam(route.params.refundId))
const company = ref('')
const trackingNo = ref('')
const shippedAt = ref(createCurrentDateTime())

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({
    name: 'member-return-detail',
    params: {
      refundId: refundId.value,
    },
  })
}

async function hydrateFormValues() {
  if (!refundId.value) {
    return
  }

  const savedShipment = await readShipmentDraft(refundId.value) ?? returnDetailPageData.value?.returnShipment

  company.value = savedShipment?.company ?? ''
  trackingNo.value = savedShipment?.trackingNo ?? ''
  shippedAt.value = savedShipment?.shippedAt
    ? savedShipment.shippedAt.slice(0, 16).replace(' ', 'T')
    : createCurrentDateTime()
}

function validateForm() {
  if (!company.value.trim()) {
    showToast('请填写物流公司')
    return false
  }

  if (!trackingNo.value.trim()) {
    showToast('请填写运单号')
    return false
  }

  if (!shippedAt.value.trim()) {
    showToast('请选择回寄时间')
    return false
  }

  return true
}

async function handleSubmit() {
  if (!refundId.value || !validateForm()) {
    return
  }

  await submitShipment(refundId.value, {
    company: company.value,
    shippedAt: formatDateTime(shippedAt.value),
    trackingNo: trackingNo.value,
  })

  showSuccessToast('回寄物流已保存')

  await router.replace({
    name: 'member-return-detail',
    params: {
      refundId: refundId.value,
    },
  })
}

watch(
  () => route.params.refundId,
  (value) => {
    refundId.value = normalizeRouteParam(value)

    if (!refundId.value) {
      return
    }

    void loadReturnShipmentPage(refundId.value).then(async () => {
      await hydrateFormValues()
    })
  },
  { immediate: true },
)

onMounted(() => {
  if (!refundId.value) {
    return
  }

  void loadReturnShipmentPage(refundId.value).then(async () => {
    await hydrateFormValues()
  })
})
</script>

<template>
  <section class="return-shipment-page">
    <PageTopBar title="填写回寄物流" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <LoadingState v-else-if="isLoading" />

      <EmptyState
        v-else-if="!returnDetailPageData"
        description="退货申请不存在，暂时无法填写回寄物流。"
        description-width="240px"
        icon="logistics"
        layout="fill"
        title="未找到退货申请"
      />

      <template v-else>
        <section class="summary-card">
          <strong>{{ returnDetailPageData.productName }}</strong>
          <p>退货单号：{{ returnDetailPageData.refundId }}</p>
          <span>请在寄回商品后填写物流信息，方便商家签收。</span>
        </section>

        <section class="form-card">
          <van-form @submit="handleSubmit">
            <van-field
              v-model="company"
              label="物流公司"
              name="company"
              placeholder="例如：顺丰速运"
            />

            <van-field
              v-model="trackingNo"
              label="运单号"
              name="trackingNo"
              placeholder="请输入快递单号"
            />

            <van-field
              v-model="shippedAt"
              label="回寄时间"
              name="shippedAt"
              type="datetime-local"
            />
          </van-form>
        </section>

        <section class="tips-card">
          <header class="tips-header">
            <van-icon name="info-o" size="18" />
            <strong>寄回提醒</strong>
          </header>

          <p>请确保退回商品、配件、赠品完整，避免影响退款时效。</p>
          <p>寄回后请妥善保存快递底单，以便售后沟通时核对。</p>
        </section>
      </template>
    </div>

    <footer v-if="returnDetailPageData" class="action-footer">
      <button class="primary-button" type="button" @click="handleSubmit">保存物流信息</button>
    </footer>
  </section>
</template>

<style scoped>
.return-shipment-page {
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

.summary-card,
.form-card,
.tips-card {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(26, 25, 24, 0.05);
}

.summary-card {
  padding: 18px 16px;
  background: linear-gradient(135deg, #fff1e6 0%, #fff8f2 100%);
}

.summary-card strong {
  color: #1a1918;
  font-size: 17px;
  font-weight: 700;
}

.summary-card p,
.summary-card span,
.tips-card p {
  margin: 0;
  color: #6d6c6a;
  font-size: 13px;
  line-height: 1.5;
}

.form-card {
  overflow: hidden;
}

.form-card :deep(.van-cell) {
  padding: 14px 16px;
}

.form-card :deep(.van-field__label) {
  width: 72px;
  color: #6d6c6a;
}

.tips-card {
  padding: 16px;
}

.tips-header {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #d97706;
}

.tips-header strong {
  color: #1a1918;
  font-size: 15px;
  font-weight: 700;
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
