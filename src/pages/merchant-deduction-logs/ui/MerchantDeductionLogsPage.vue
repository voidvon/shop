<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  List as VanList,
  PullRefresh as VanPullRefresh,
  Tag as VanTag,
  showFailToast,
} from 'vant'

import {
  hydrateBackendAMemberAuthSession,
  useMemberAuthSession,
} from '@/entities/member-auth'
import {
  type MerchantDeductionLogItem,
  useMerchantDeductionService,
} from '@/processes/merchant-deduction'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import SectionCard from '@/shared/ui/SectionCard.vue'

const PAGE_SIZE = 20

const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const merchantDeductionService = useMerchantDeductionService()
const authSnapshot = ref(memberAuthSession.getSnapshot())
const logs = ref<MerchantDeductionLogItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const isPageInitializing = ref(true)
const isRefreshing = ref(false)
const isInitialLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(false)
const hasLoadedOnce = ref(false)
const errorMessage = ref('')

const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
  authSnapshot.value = snapshot
})

onUnmounted(() => {
  stopAuthSubscription()
})

const normalizedMerchantId = computed(() => authSnapshot.value.authResult?.userInfo.merchantId?.trim() ?? '')
const isMerchantStaff = computed(() => Boolean(normalizedMerchantId.value))
const merchantDisplayName = computed(() =>
  authSnapshot.value.authResult?.userInfo.merchantName?.trim()
  || logs.value[0]?.merchantName
  || '当前店铺',
)
const totalLabel = computed(() => `${total.value} 笔`)
const hasLogs = computed(() => logs.value.length > 0)

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'merchant-deduction' })
}

function formatAmount(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00'
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '未返回'
  }

  const parsedValue = new Date(value.replace(' ', 'T'))

  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(parsedValue)
}

function formatMobile(value: string | null) {
  if (!value) {
    return '未返回'
  }

  const normalizedValue = value.replace(/\s+/g, '')

  if (/^\d{11}$/.test(normalizedValue)) {
    return `${normalizedValue.slice(0, 3)}****${normalizedValue.slice(-4)}`
  }

  return value
}

function getUserSummary(log: MerchantDeductionLogItem) {
  const parts = [log.userName, log.userMobile ? formatMobile(log.userMobile) : null].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '未返回用户信息'
}

function getDetailSummary(log: MerchantDeductionLogItem) {
  const parts = [log.paySourceLabel, log.balanceTypeName].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : log.paySourceLabel
}

function resolveStatusType(status: MerchantDeductionLogItem['status']) {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'processing':
      return 'primary'
    default:
      return 'default'
  }
}

async function loadLogs(mode: 'append' | 'initial' | 'refresh') {
  if (mode === 'append') {
    if (isInitialLoading.value || isRefreshing.value || isLoadingMore.value || !hasMore.value) {
      isLoadingMore.value = false
      return
    }

    isLoadingMore.value = true
  }

  if (mode === 'initial') {
    if (isInitialLoading.value) {
      return
    }

    isInitialLoading.value = true
  }

  if (mode === 'refresh') {
    if (isRefreshing.value) {
      return
    }

    isRefreshing.value = true
  }

  const nextPage = mode === 'append' ? currentPage.value + 1 : 1

  try {
    const pageData = await merchantDeductionService.getDeductionLogs({
      page: nextPage,
      pageSize: PAGE_SIZE,
    })

    logs.value = mode === 'append'
      ? [...logs.value, ...pageData.list]
      : pageData.list
    total.value = pageData.total
    currentPage.value = pageData.page
    hasMore.value = pageData.hasMore
    errorMessage.value = ''
    hasLoadedOnce.value = true
  } catch (error) {
    const message = error instanceof Error ? error.message : '店铺流水加载失败'

    if (mode !== 'append' || logs.value.length === 0) {
      errorMessage.value = message
    }

    showFailToast(message)
  } finally {
    if (mode === 'append') {
      isLoadingMore.value = false
    }

    if (mode === 'initial') {
      isInitialLoading.value = false
    }

    if (mode === 'refresh') {
      isRefreshing.value = false
    }
  }
}

async function initializePage() {
  isPageInitializing.value = true

  try {
    await hydrateBackendAMemberAuthSession(memberAuthSession)
  } catch {
    // Ignore refresh failures here and let the list request surface the error.
  }

  if (!isMerchantStaff.value) {
    hasLoadedOnce.value = false
    isPageInitializing.value = false
    return
  }

  try {
    await loadLogs('initial')
  } finally {
    isPageInitializing.value = false
  }
}

async function handleRefresh() {
  if (!isMerchantStaff.value) {
    isRefreshing.value = false
    return
  }

  await loadLogs('refresh')
}

async function handleLoadMore() {
  if (!isMerchantStaff.value) {
    isLoadingMore.value = false
    return
  }

  await loadLogs('append')
}

onMounted(() => {
  void initializePage()
})
</script>

<template>
  <section class="merchant-deduction-logs-page">
    <PageTopBar title="店铺流水查询" @back="goBack" />

    <LoadingState
      v-if="isPageInitializing"
      class="page-loading-state"
      fill
      text="正在加载店铺流水..."
    />

    <div v-else-if="!isMerchantStaff" class="merchant-staff-empty-state">
      <strong>您还不是商户员工</strong>
    </div>

    <VanPullRefresh
      v-else
      v-model="isRefreshing"
      class="merchant-deduction-logs-refresh"
      success-text="刷新成功"
      @refresh="handleRefresh"
    >
      <div class="content-scroll">
        <SectionCard title="当前店铺" description="下拉刷新最新流水，上拉继续加载下一页。">
          <div class="summary-grid">
            <div class="summary-item">
              <span>店铺名称</span>
              <strong>{{ merchantDisplayName }}</strong>
            </div>

            <div class="summary-item">
              <span>流水总数</span>
              <strong>{{ totalLabel }}</strong>
            </div>
          </div>
        </SectionCard>

        <section class="list-section">
          <header class="list-head">
            <strong>流水明细</strong>
            <span v-if="hasLoadedOnce">第 {{ currentPage }} 页</span>
          </header>

          <LoadingState v-if="isInitialLoading && !hasLogs" class="list-state" fill text="正在加载店铺流水..." />

          <section v-else-if="errorMessage && !hasLogs" class="list-state">
            <EmptyState
              boxed
              description="请下拉刷新，或点击下方按钮重新加载。"
              description-width="240px"
              icon="warning-o"
              title="流水加载失败"
            />
            <p class="error-message">{{ errorMessage }}</p>
            <button class="retry-button" type="button" @click="loadLogs('initial')">
              重新加载
            </button>
          </section>

          <EmptyState
            v-else-if="hasLoadedOnce && !hasLogs"
            boxed
            class="list-state"
            description="当前店铺暂时还没有线下支付流水。"
            description-width="240px"
            icon="orders-o"
            title="暂无流水"
          />

          <VanList
            v-else
            v-model:loading="isLoadingMore"
            class="log-list"
            :finished="!hasMore"
            finished-text="没有更多流水了"
            offset="80"
            @load="handleLoadMore"
          >
            <article v-for="log in logs" :key="log.id" class="log-card">
              <header class="log-card-head">
                <div class="log-card-title">
                  <strong>¥{{ formatAmount(log.amount) }}</strong>
                  <p>{{ getDetailSummary(log) }}</p>
                </div>

                <VanTag plain round :type="resolveStatusType(log.status)">
                  {{ log.statusLabel }}
                </VanTag>
              </header>

              <dl class="log-detail-grid">
                <div>
                  <dt>付款单号</dt>
                  <dd>{{ log.paymentNo }}</dd>
                </div>

                <div>
                  <dt>支付用户</dt>
                  <dd>{{ getUserSummary(log) }}</dd>
                </div>

                <div>
                  <dt>创建时间</dt>
                  <dd>{{ formatDateTime(log.createdAt) }}</dd>
                </div>

                <div>
                  <dt>成功时间</dt>
                  <dd>{{ formatDateTime(log.paidAt) }}</dd>
                </div>

                <div v-if="log.cardNumber">
                  <dt>储值卡号</dt>
                  <dd>{{ log.cardNumber }}</dd>
                </div>

                <div v-if="log.remark">
                  <dt>备注</dt>
                  <dd>{{ log.remark }}</dd>
                </div>

                <div v-if="log.failureReason">
                  <dt>失败原因</dt>
                  <dd class="log-detail-danger">{{ log.failureReason }}</dd>
                </div>
              </dl>
            </article>
          </VanList>
        </section>
      </div>
    </VanPullRefresh>
  </section>
</template>

<style scoped>
.merchant-deduction-logs-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(231, 111, 81, 0.16), transparent 32%),
    linear-gradient(180deg, #fff9f4 0%, #f2ede7 100%);
  overflow: hidden;
}

.merchant-deduction-logs-refresh,
.content-scroll {
  min-height: 100%;
}

.page-loading-state {
  min-height: calc(100vh - 49px);
  min-height: calc(100dvh - 49px);
}

.merchant-staff-empty-state {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 140px);
  min-height: calc(100dvh - 140px);
  padding: 24px;
  text-align: center;
}

.merchant-staff-empty-state strong {
  color: #1f1d1a;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
}

.content-scroll {
  padding: 12px 16px 24px;
}

.summary-grid,
.summary-item,
.list-section,
.list-state,
.log-list,
.log-card,
.log-card-title,
.log-detail-grid {
  display: grid;
}

.summary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  gap: 8px;
  min-width: 0;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 245, 238, 0.95) 0%, rgba(255, 237, 226, 0.92) 100%);
}

.summary-item span,
.list-head span,
.log-card-title p,
.log-detail-grid dt {
  color: #8b7768;
}

.summary-item strong,
.list-head strong,
.log-card-title strong,
.log-detail-grid dd {
  color: #1f1d1a;
}

.summary-item span {
  font-size: 12px;
}

.summary-item strong {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.list-section {
  gap: 12px;
  margin-top: 12px;
}

.list-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 0 4px;
}

.list-head strong {
  font-size: 17px;
}

.list-head span {
  font-size: 12px;
}

.list-state {
  justify-items: center;
  gap: 12px;
  min-height: 280px;
  align-content: center;
}

.error-message {
  margin: 0;
  color: #b45309;
  font-size: 13px;
  text-align: center;
}

.retry-button {
  min-width: 128px;
  padding: 10px 18px;
  border: 0;
  border-radius: 999px;
  background: #ea580c;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.log-list {
  gap: 12px;
}

.log-card {
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(27, 25, 22, 0.08);
}

.log-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.log-card-title {
  gap: 6px;
  min-width: 0;
}

.log-card-title strong {
  font-size: 24px;
  line-height: 1;
}

.log-card-title p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.log-detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.log-detail-grid div {
  min-width: 0;
  padding: 12px 14px;
  border-radius: 16px;
  background: #faf7f3;
}

.log-detail-grid dt {
  margin-bottom: 6px;
  font-size: 12px;
}

.log-detail-grid dd {
  margin: 0;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.5;
}

.log-detail-danger {
  color: #b91c1c;
}

@media (max-width: 420px) {
  .summary-grid,
  .log-detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
