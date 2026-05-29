<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import {
  List as VanList,
  PullRefresh as VanPullRefresh,
  Tag as VanTag,
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
} from 'vant'

import {
  hydrateBackendAMemberAuthSession,
  useMemberAuthSession,
} from '@/entities/member-auth'
import {
  type MerchantDeductionLogItem,
  type MerchantDeductionStaffOption,
  type MerchantDeductionStatistics,
  useMerchantDeductionService,
} from '@/processes/merchant-deduction'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const PAGE_SIZE = 20
const emptyStatistics: MerchantDeductionStatistics = {
  normalOrderCount: 0,
  normalPaymentAmount: 0,
  refundAmount: 0,
  refundOrderCount: 0,
}

const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const merchantDeductionService = useMerchantDeductionService()
const authSnapshot = ref(memberAuthSession.getSnapshot())
const scrollContainer = useTemplateRef<HTMLDivElement>('scrollContainer')
const logs = ref<MerchantDeductionLogItem[]>([])
const staffList = ref<MerchantDeductionStaffOption[]>([])
const statistics = ref<MerchantDeductionStatistics>({ ...emptyStatistics })
const currentPage = ref(1)
const isPageInitializing = ref(true)
const isRefreshing = ref(false)
const isInitialLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(false)
const hasLoadedOnce = ref(false)
const errorMessage = ref('')
const refundingLogId = ref<string | null>(null)
const selectedVerifierUserId = ref('')
const minAmountInput = ref('')
const maxAmountInput = ref('')
const startTimeInput = ref('')
const endTimeInput = ref('')
const datePickerVisible = ref(false)
const activeDateField = ref<'end' | 'start'>('start')
const datePickerValue = ref<string[]>(createDatePickerValue())

const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
  authSnapshot.value = snapshot
})

onUnmounted(() => {
  stopAuthSubscription()
})

const normalizedMerchantId = computed(() => authSnapshot.value.authResult?.userInfo.merchantId?.trim() ?? '')
const isMerchantStaff = computed(() => Boolean(normalizedMerchantId.value))
const hasLogs = computed(() => logs.value.length > 0)
const activeFilterCount = computed(() => [
  selectedVerifierUserId.value,
  minAmountInput.value,
  maxAmountInput.value,
  startTimeInput.value,
  endTimeInput.value,
].filter((value) => value.trim()).length)
const hasStatistics = computed(() =>
  statistics.value.normalOrderCount > 0
  || statistics.value.normalPaymentAmount > 0
  || statistics.value.refundOrderCount > 0
  || statistics.value.refundAmount > 0,
)

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

function normalizeAmountInput(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  const parsedValue = Number.parseFloat(normalizedValue)
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null
}

function createDatePickerValue(value?: string | null) {
  const normalizedValue = value?.trim()

  if (normalizedValue && /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue.split('-')
  }

  const now = new Date()
  return [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ]
}

function formatDatePickerValue(values: string[]) {
  const [year, month, day] = values

  if (!year || !month || !day) {
    return ''
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function openDatePicker(field: 'end' | 'start') {
  activeDateField.value = field
  datePickerValue.value = createDatePickerValue(field === 'start' ? startTimeInput.value : endTimeInput.value)
  datePickerVisible.value = true
}

function handleDatePickerConfirm(payload?: { selectedValues?: string[] }) {
  const selectedDate = formatDatePickerValue(payload?.selectedValues ?? datePickerValue.value)

  if (activeDateField.value === 'start') {
    startTimeInput.value = selectedDate
  } else {
    endTimeInput.value = selectedDate
  }

  datePickerVisible.value = false
}

function createDateRangeBoundary(value: string, boundary: 'end' | 'start') {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  return boundary === 'start'
    ? `${normalizedValue} 00:00:00`
    : `${normalizedValue} 23:59:59`
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

function getStaffSummary(log: MerchantDeductionLogItem) {
  const parts = [
    log.staffName,
    log.staffMobile ? formatMobile(log.staffMobile) : null,
    log.staffUserId ? `ID ${log.staffUserId}` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : '未返回核销人员'
}

function resolveStatusType(status: MerchantDeductionLogItem['status']) {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'processing':
      return 'primary'
    case 'refunded':
      return 'warning'
    default:
      return 'default'
  }
}

function canRefund(log: MerchantDeductionLogItem) {
  return log.canRefund && log.status === 'success'
}

async function handleRefund(log: MerchantDeductionLogItem) {
  if (!canRefund(log) || refundingLogId.value) {
    return
  }

  try {
    await showConfirmDialog({
      title: '确认退款',
      message: `确认退款 ¥${formatAmount(log.amount)} 吗？退款将按原支付来源原路返回。`,
    })
  } catch {
    return
  }

  refundingLogId.value = log.id

  try {
    const result = await merchantDeductionService.refundDeduction(log.id)
    await loadLogs('initial')
    showSuccessToast(result.successMessage || '退款成功')
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '退款失败')
  } finally {
    refundingLogId.value = null
  }
}

async function loadLogs(mode: 'append' | 'initial' | 'refresh') {
  if (mode === 'append') {
    if (isInitialLoading.value || isRefreshing.value || !hasMore.value) {
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
    if (isInitialLoading.value || isLoadingMore.value) {
      return
    }

    isRefreshing.value = true
  }

  const nextPage = mode === 'append' ? currentPage.value + 1 : 1
  const minAmount = normalizeAmountInput(minAmountInput.value)
  const maxAmount = normalizeAmountInput(maxAmountInput.value)

  if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
    const message = '最低金额不能大于最高金额'
    errorMessage.value = logs.value.length === 0 ? message : ''
    showFailToast(message)
    isInitialLoading.value = false
    isRefreshing.value = false
    isLoadingMore.value = false
    return
  }

  try {
    const pageData = await merchantDeductionService.getDeductionLogs({
      endTime: createDateRangeBoundary(endTimeInput.value, 'end'),
      maxAmount,
      minAmount,
      page: nextPage,
      pageSize: PAGE_SIZE,
      startTime: createDateRangeBoundary(startTimeInput.value, 'start'),
      verifierUserId: selectedVerifierUserId.value,
    })

    logs.value = mode === 'append'
      ? [...logs.value, ...pageData.list]
      : pageData.list
    staffList.value = pageData.staffList
    statistics.value = pageData.statistics
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

function selectStaffFilter(staff: MerchantDeductionStaffOption | null) {
  selectedVerifierUserId.value = staff?.verifierUserId ?? ''
  void loadLogs('initial')
}

function applyFilters() {
  void loadLogs('initial')
}

function resetFilters() {
  selectedVerifierUserId.value = ''
  minAmountInput.value = ''
  maxAmountInput.value = ''
  startTimeInput.value = ''
  endTimeInput.value = ''
  void loadLogs('initial')
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

    <div v-else ref="scrollContainer" class="merchant-deduction-logs-scroll">
      <VanPullRefresh
        v-model="isRefreshing"
        class="merchant-deduction-logs-refresh"
        success-text="刷新成功"
        @refresh="handleRefresh"
      >
        <div class="content-scroll">
          <section class="summary-section">
            <div class="summary-head">
              <strong>流水统计</strong>
              <span v-if="activeFilterCount > 0">{{ activeFilterCount }} 个筛选条件</span>
            </div>

            <van-grid
              class="statistics-grid"
              :class="{ 'statistics-grid-empty': !hasStatistics }"
              :border="false"
              :column-num="2"
              gutter="8"
            >
              <van-grid-item class="statistics-card statistics-card-income">
                <span>正常订单</span>
                <strong>{{ statistics.normalOrderCount }}</strong>
              </van-grid-item>
              <van-grid-item class="statistics-card statistics-card-income">
                <span>正常收款</span>
                <strong>¥{{ formatAmount(statistics.normalPaymentAmount) }}</strong>
              </van-grid-item>
              <van-grid-item class="statistics-card statistics-card-refund">
                <span>退款订单</span>
                <strong>{{ statistics.refundOrderCount }}</strong>
              </van-grid-item>
              <van-grid-item class="statistics-card statistics-card-refund">
                <span>退款金额</span>
                <strong>¥{{ formatAmount(statistics.refundAmount) }}</strong>
              </van-grid-item>
            </van-grid>
          </section>

          <section class="filter-section" aria-label="流水筛选">
            <div class="filter-section-head">
              <strong>筛选</strong>
              <van-button
                v-if="activeFilterCount > 0"
                class="filter-reset-link"
                size="mini"
                native-type="button"
                @click="resetFilters"
              >
                重置
              </van-button>
            </div>

            <div v-if="staffList.length > 0" class="staff-filter-row" aria-label="核销人员筛选">
              <van-button
                class="staff-filter-chip"
                :class="{ 'staff-filter-chip-active': selectedVerifierUserId === '' }"
                round
                size="small"
                native-type="button"
                :type="selectedVerifierUserId === '' ? 'primary' : 'default'"
                @click="selectStaffFilter(null)"
              >
                全部人员
              </van-button>
              <van-button
                v-for="staff in staffList"
                :key="staff.id"
                class="staff-filter-chip"
                :class="{ 'staff-filter-chip-active': selectedVerifierUserId === staff.verifierUserId }"
                round
                size="small"
                native-type="button"
                :type="selectedVerifierUserId === staff.verifierUserId ? 'primary' : 'default'"
                @click="selectStaffFilter(staff)"
              >
                {{ staff.name || `员工 ${staff.verifierUserId}` }}
              </van-button>
            </div>

            <div class="filter-grid">
              <van-field
                v-model="minAmountInput"
                class="filter-field"
                input-align="right"
                label="最低金额"
                placeholder="0.00"
                type="number"
              />
              <van-field
                v-model="maxAmountInput"
                class="filter-field"
                input-align="right"
                label="最高金额"
                placeholder="不限"
                type="number"
              />
              <van-field
                v-model="startTimeInput"
                class="filter-field filter-field-date filter-field-wide"
                input-align="left"
                label="开始时间"
                placeholder="请选择"
                readonly
                @click="openDatePicker('start')"
              />
              <van-field
                v-model="endTimeInput"
                class="filter-field filter-field-date filter-field-wide"
                input-align="left"
                label="结束时间"
                placeholder="请选择"
                readonly
                @click="openDatePicker('end')"
              />
            </div>

            <van-button block class="filter-submit-button" round type="primary" @click="applyFilters">
              查询流水
            </van-button>
          </section>

          <section class="list-section">
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
              <van-button class="retry-button" round type="primary" @click="loadLogs('initial')">
                重新加载
              </van-button>
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
              :scroller="scrollContainer ?? undefined"
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
                  </div>

                  <VanTag round :type="resolveStatusType(log.status)">
                    {{ log.statusLabel }}
                  </VanTag>
                </header>

                <dl class="log-detail-grid">
                  <div class="log-detail-meta">
                    <div class="log-detail-row">
                      <dt>付款单号</dt>
                      <dd>{{ log.paymentNo }}</dd>
                    </div>

                    <div class="log-detail-row">
                      <dt>支付用户</dt>
                      <dd>{{ getUserSummary(log) }}</dd>
                    </div>

                    <div class="log-detail-row">
                      <dt>核销人员</dt>
                      <dd>{{ getStaffSummary(log) }}</dd>
                    </div>

                    <div class="log-detail-row">
                      <dt>成功时间</dt>
                      <dd>{{ formatDateTime(log.paidAt) }}</dd>
                    </div>
                  </div>

                  <div v-if="log.cardNumber">
                    <dt>储值卡号</dt>
                    <dd>{{ log.cardNumber }}</dd>
                  </div>

                  <div v-if="log.remark">
                    <dt>备注</dt>
                    <dd>{{ log.remark }}</dd>
                  </div>

                  <div v-if="log.refundNo || log.refundedAt">
                    <dt>退款信息</dt>
                    <dd>
                      {{ [log.refundNo ? `退款单号 ${log.refundNo}` : null, log.refundedAt ? `退款时间 ${formatDateTime(log.refundedAt)}` : null].filter(Boolean).join(' · ') }}
                    </dd>
                  </div>

                  <div v-if="log.failureReason">
                    <dt>失败原因</dt>
                    <dd class="log-detail-danger">{{ log.failureReason }}</dd>
                  </div>
                </dl>

                <div v-if="canRefund(log)" class="log-card-actions">
                  <button
                    class="refund-button"
                    :disabled="refundingLogId === log.id"
                    type="button"
                    @click="handleRefund(log)"
                  >
                    {{ refundingLogId === log.id ? '退款中...' : '发起退款' }}
                  </button>
                </div>
              </article>
            </VanList>
          </section>
        </div>
      </VanPullRefresh>
    </div>

    <van-popup v-model:show="datePickerVisible" position="bottom" round teleport="body">
      <van-date-picker
        v-model="datePickerValue"
        :title="activeDateField === 'start' ? '选择开始日期' : '选择结束日期'"
        @cancel="datePickerVisible = false"
        @confirm="handleDatePickerConfirm"
      />
    </van-popup>
  </section>
</template>

<style scoped>
.merchant-deduction-logs-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: var(--color-surface-elevated);
  overflow: hidden;
}

.merchant-deduction-logs-scroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.merchant-deduction-logs-scroll::-webkit-scrollbar {
  display: none;
}

.merchant-deduction-logs-refresh {
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
  color: var(--color-text-heading);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
}

.content-scroll {
  min-height: 100%;
  padding: 12px 16px 24px;
}

.summary-section,
.filter-section,
.list-section,
.list-state,
.log-list,
.log-card,
.log-card-title,
.log-detail-grid {
  display: grid;
}

.log-detail-grid dt {
  color: var(--color-text-subtle);
}

.log-card-title strong,
.log-detail-grid dd {
  color: var(--color-text-heading);
}

.list-section {
  gap: 12px;
}

.summary-section,
.filter-section {
  gap: 12px;
  margin-bottom: 12px;
  padding: 14px;
  border-radius: 18px;
  background: var(--color-surface-elevated);
  box-shadow: 0 12px 28px rgba(var(--shadow-rgb), 0.06);
}

.summary-head,
.filter-section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.summary-head strong,
.filter-section-head strong {
  color: var(--color-text-heading);
  font-size: 15px;
}

.summary-head span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.statistics-grid {
  --van-grid-item-content-padding: 0;
}

.statistics-card {
  min-width: 0;
}

.statistics-card :deep(.van-grid-item__content) {
  display: grid;
  justify-items: start;
  gap: 6px;
  min-width: 0;
  min-height: 72px;
  padding: 10px;
  border-radius: 14px;
  background: var(--color-surface-soft);
}

.statistics-card span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.statistics-card strong {
  color: var(--color-text-heading);
  font-size: 16px;
  line-height: 1.2;
  word-break: break-all;
}

.statistics-card-income strong {
  color: var(--color-primary-deep);
}

.statistics-card-refund strong {
  color: var(--color-warning);
}

.statistics-grid-empty .statistics-card strong {
  color: var(--color-text-muted);
}

.filter-reset-link {
  height: 28px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.filter-reset-link::before {
  display: none;
}

.filter-reset-link :deep(.van-button__content) {
  height: auto;
}

.staff-filter-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.staff-filter-row::-webkit-scrollbar {
  display: none;
}

.staff-filter-chip {
  flex: none;
  max-width: 128px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.staff-filter-chip :deep(.van-button__text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.filter-field {
  min-width: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-surface-soft);
}

.filter-field :deep(.van-field__label) {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.filter-field :deep(.van-field__control) {
  color: var(--color-text-heading);
  font-size: 13px;
}

.filter-field-date {
  --van-field-label-width: auto;
  --van-field-label-margin-right: 8px;
  cursor: pointer;
}

.filter-field-date :deep(.van-field__body) {
  flex: none;
  min-width: 58px;
}

.filter-field-date :deep(.van-field__control) {
  min-width: 58px;
}

.filter-field-wide {
  grid-column: span 1;
}

.filter-submit-button {
  min-height: 40px;
  font-size: 14px;
  font-weight: 600;
}

.list-state {
  justify-items: center;
  gap: 12px;
  min-height: 280px;
  align-content: center;
}

.error-message {
  margin: 0;
  color: var(--color-warning);
  font-size: 13px;
  text-align: center;
}

.retry-button {
  min-width: 128px;
  font-size: 14px;
  font-weight: 600;
}

.log-list {
  gap: 12px;
}

.log-list :deep(.van-list__loading),
.log-list :deep(.van-list__finished-text) {
  display: flex;
  justify-content: center;
  padding-top: 4px;
  color: var(--color-text-faint);
  text-align: center;
}

.log-list :deep(.van-list__loading) {
  font-size: 13px;
}

.log-list :deep(.van-list__loading .van-loading) {
  color: var(--color-text-faint);
}

.log-card {
  gap: 12px;
  padding: 16px;
  border-radius: 22px;
  background: var(--color-surface-elevated);
  box-shadow: 0 14px 32px rgba(var(--shadow-rgb), 0.08);
}

.log-card-actions {
  display: flex;
  justify-content: flex-end;
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

.log-detail-grid {
  margin: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.log-detail-grid > div {
  min-width: 0;
  padding: 10px 14px;
  border-radius: 16px;
  background: var(--color-surface-soft);
}

.log-detail-meta {
  grid-column: 1 / -1;
  gap: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.log-detail-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.log-detail-grid dt {
  font-size: 12px;
}

.log-detail-grid dd {
  margin: 0;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.5;
}

.refund-button {
  min-width: 96px;
  padding: 9px 14px;
  border: 0;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 13px;
  font-weight: 600;
}

.refund-button:disabled {
  opacity: 0.56;
}

.log-detail-meta .log-detail-row dd {
  text-align: right;
  word-break: normal;
}

.log-detail-danger {
  color: var(--color-danger);
}

@media (max-width: 420px) {
  .statistics-grid {
    --van-grid-item-content-padding: 0;
  }

  .log-detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
