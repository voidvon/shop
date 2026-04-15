<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'

import { useMemberAuthSession } from '@/entities/member-auth'
import { MemberCardBindPanel, useMemberCardBinding } from '@/features/member-card-binding'
import { prepareMemberCardScanByWechat, scanMemberCardByWechat } from '@/features/member-card-binding/model/member-card-scanner'
import type { LookupMemberCardResult } from '@/processes/member-center'
import { normalizeMemberCardBindMobile, validateMemberCardBindMobile } from '@/processes/member-center/domain/member-card-bind-rules'
import { isWechatBrowser } from '@/shared/lib/wechat-browser'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCardsPageModel } from '../model/useMemberCardsPageModel'

const route = useRoute()
const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const isLookingUp = ref(false)
const isSubmitting = ref(false)
const cardNumber = ref('')
const cardSecret = ref('')
const mobile = ref('')
const lookupResult = ref<LookupMemberCardResult | null>(null)
const { bindMemberCard, lookupMemberCard } = useMemberCardBinding()
const { errorMessage, isLoading, loadMemberCardsPage, memberCardsPageData } = useMemberCardsPageModel()
const bindDrawerVisible = computed(() => route.query.drawer === 'bind')
const bindPreviewVisible = ref(false)
const defaultMobile = computed(() =>
  normalizeMemberCardBindMobile(memberAuthSession.getSnapshot().authResult?.userInfo.mobile ?? ''),
)
const canScanCardByWechat = computed(
  () => memberAuthSession.getSnapshot().authResult?.capabilities.includes('wechat-scan-card') === true,
)
const normalizedMobile = computed(() => normalizeMemberCardBindMobile(mobile.value))
const mobileErrorMessage = computed(() => validateMemberCardBindMobile(normalizedMobile.value) ?? '')
const hasValidMobile = computed(() => !mobileErrorMessage.value)
const canConfirmBind = computed(() =>
  !isSubmitting.value && Boolean(lookupResult.value?.canBind) && hasValidMobile.value,
)

function formatAmount(amount: number) {
  return amount.toFixed(2)
}

function maskCardNumber(cardNumberValue: string) {
  if (cardNumberValue.length <= 8) {
    return cardNumberValue
  }

  return `${cardNumberValue.slice(0, 4)} **** ${cardNumberValue.slice(-4)}`
}

function formatPreviewTitle(result: LookupMemberCardResult | null) {
  return result?.balanceTypeName || '储值卡信息'
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

function buildBaseRouteQuery() {
  const nextQuery = { ...route.query }

  delete nextQuery.drawer

  return nextQuery
}

async function replaceBaseRouteQuery() {
  const baseQuery = buildBaseRouteQuery()

  await router.replace({
    query: Object.keys(baseQuery).length > 0 ? baseQuery : undefined,
  })
}

function goToBindCard() {
  if (!mobile.value) {
    mobile.value = defaultMobile.value
  }

  void router.push({
    query: {
      ...route.query,
      drawer: 'bind',
    },
  })
}

function goToBalanceDetail() {
  void router.push({ name: 'member-balance' })
}

async function closeBindDrawer() {
  if (!bindDrawerVisible.value) {
    return
  }

  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    await router.back()
    return
  }

  await replaceBaseRouteQuery()
}

function handleBindDrawerVisibilityChange(show: boolean) {
  if (show) {
    return
  }

  void closeBindDrawer()
}

function closeBindPreview() {
  bindPreviewVisible.value = false
}

async function openBindPreview() {
  isLookingUp.value = true

  try {
    lookupResult.value = await lookupMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
    })
    bindPreviewVisible.value = true
  } catch (error) {
    lookupResult.value = null
    bindPreviewVisible.value = false
    showFailToast(error instanceof Error ? error.message : '卡信息查询失败')
  } finally {
    isLookingUp.value = false
  }
}

async function submitBindCard() {
  mobile.value = normalizedMobile.value

  if (mobileErrorMessage.value) {
    showFailToast(mobileErrorMessage.value)
    return
  }

  if (!lookupResult.value?.canBind) {
    showFailToast('当前卡券不可绑定充值')
    return
  }

  isSubmitting.value = true

  try {
    await bindMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
      mobile: normalizedMobile.value,
    })
    showSuccessToast('充值成功')
    closeBindPreview()
    await closeBindDrawer()
    await loadMemberCardsPage()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '卡券充值失败')
  } finally {
    isSubmitting.value = false
  }
}

async function runLookupCard() {
  await openBindPreview()
}

async function applyScannedCardInfo(nextCardNumber: string, nextCardSecret: string) {
  if (!nextCardNumber) {
    showFailToast('未读取到卡券编号，请手动输入后重试')
    return
  }

  cardNumber.value = nextCardNumber
  cardSecret.value = nextCardSecret

  if (!nextCardSecret) {
    showSuccessToast('已读取卡号，请补充卡密后继续')
    return
  }

  showSuccessToast('已读取卡券信息')
  await openBindPreview()
}

async function handleScanCard() {
  if (!canScanCardByWechat.value) {
    showFailToast('当前账号暂不支持微信扫码绑卡')
    return
  }

  if (!isWechatBrowser()) {
    showFailToast('请在微信内打开当前页面后扫码')
    return
  }

  const loadingToast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '加载中...',
  })

  try {
    await prepareMemberCardScanByWechat()
    loadingToast.close()
    const scanResult = await scanMemberCardByWechat()
    await applyScannedCardInfo(scanResult.cardNumber, scanResult.cardSecret)
  } catch (error) {
    loadingToast.close()
    const message = error instanceof Error ? error.message : '微信扫码失败'

    if (message === '已取消扫码') {
      return
    }

    showFailToast(message)
  }
}

watch(bindDrawerVisible, (visible, previousVisible) => {
  if (visible && !previousVisible && !mobile.value) {
    mobile.value = defaultMobile.value
    return
  }

  if (visible || !previousVisible) {
    return
  }

  cardNumber.value = ''
  cardSecret.value = ''
  mobile.value = defaultMobile.value
  lookupResult.value = null
  bindPreviewVisible.value = false
})

watch([cardNumber, cardSecret], () => {
  lookupResult.value = null
  bindPreviewVisible.value = false
})

onMounted(async () => {
  mobile.value = defaultMobile.value
  await loadMemberCardsPage()

  if (errorMessage.value) {
    showFailToast(errorMessage.value)
  }
})
</script>

<template>
  <section class="member-cards-page">
    <PageTopBar title="我的卡券" @back="goBack" />

    <section class="balance-bar">
      <div class="balance-left">
        <span class="balance-label">总账户余额</span>
        <span class="balance-pill">¥ {{ formatAmount(memberCardsPageData.balanceAmount) }}</span>
        <span class="balance-meta">{{ memberCardsPageData.balanceAccounts.length }} 类余额账户</span>
      </div>

      <button class="pay-link" type="button" @click="goToBalanceDetail">余额明细</button>
    </section>

    <div class="content-area">
      <section class="intro-card">
        <div>
          <strong>扫码绑定卡券并充值</strong>
          <p>实体卡绑定后，实体卡中的余额将转入线上账户，实体卡作废清零！</p>
        </div>
        <button class="secondary-button" type="button" @click="goToBindCard">绑定新卡</button>
      </section>

      <LoadingState v-if="isLoading" />

      <section v-else-if="memberCardsPageData.redemptionRecords.length > 0" class="records-card">
        <header class="records-header">
          <strong>充值记录</strong>
          <span>共 {{ memberCardsPageData.redemptionRecords.length }} 笔</span>
        </header>

        <article v-for="record in memberCardsPageData.redemptionRecords" :key="record.id" class="record-row">
          <div class="record-main">
            <div>
              <strong>{{ record.cardTitle }}</strong>
              <p>{{ maskCardNumber(record.cardNumber) }}</p>
            </div>
            <span class="record-amount">+¥{{ formatAmount(record.amount) }}</span>
          </div>
          <div class="record-meta">
            <span>记录号 {{ record.redeemedCode }}</span>
            <time :datetime="record.occurredAt">{{ record.occurredAt }}</time>
          </div>
        </article>
      </section>

      <EmptyState
        v-else
        boxed
        class="empty-state"
        description="当前没有可展示的充值记录。"
        description-width="248px"
        icon="coupon-o"
        :icon-size="40"
        title="暂无充值记录"
      />
    </div>

    <van-popup
      :show="bindDrawerVisible"
      class="bind-drawer"
      position="right"
      teleport="body"
      :style="{ width: '100vw', height: '100dvh' }"
      @update:show="handleBindDrawerVisibilityChange"
    >
      <section class="bind-drawer-body">
        <PageTopBar title="绑定卡券" back-aria-label="关闭绑定卡券抽屉" @back="closeBindDrawer" />

        <MemberCardBindPanel
          v-model:card-number="cardNumber"
          v-model:card-secret="cardSecret"
          :is-looking-up="isLookingUp"
          :is-submitting="isSubmitting"
          @preview="runLookupCard"
          @scan="handleScanCard"
        />
      </section>
    </van-popup>

    <van-popup
      :show="bindPreviewVisible"
      class="bind-preview-popup"
      position="bottom"
      round
      teleport="body"
      @update:show="closeBindPreview"
    >
      <section class="bind-preview-sheet">
        <header class="preview-header">
          <div>
            <strong>绑定预览</strong>
            <p>确认卡信息和手机号后，再提交绑定。</p>
          </div>
          <button class="preview-close" type="button" @click="closeBindPreview">关闭</button>
        </header>

        <section v-if="lookupResult" class="lookup-card">
          <div class="lookup-header">
            <strong>{{ formatPreviewTitle(lookupResult) }}</strong>
            <span :class="['lookup-status', { 'lookup-status-disabled': !lookupResult.canBind }]">
              {{ lookupResult.statusText }}
            </span>
          </div>
          <dl class="lookup-grid">
            <div>
              <dt>卡号</dt>
              <dd>{{ lookupResult.cardNumber }}</dd>
            </div>
            <div>
              <dt>面值</dt>
              <dd>¥{{ formatAmount(lookupResult.faceValue) }}</dd>
            </div>
            <div>
              <dt>当前余额</dt>
              <dd>¥{{ formatAmount(lookupResult.currentAmount) }}</dd>
            </div>
            <div>
              <dt>是否可绑</dt>
              <dd>{{ lookupResult.canBind ? '可绑定' : '不可绑定' }}</dd>
            </div>
          </dl>
        </section>

        <label class="mobile-field">
          <span>手机号</span>
          <input
            v-model="mobile"
            type="tel"
            inputmode="numeric"
            maxlength="11"
            placeholder="请输入绑定手机号"
          >
        </label>
        <p v-if="mobileErrorMessage" class="mobile-hint mobile-hint-error">{{ mobileErrorMessage }}</p>

        <div class="preview-actions">
          <button class="preview-cancel" type="button" @click="closeBindPreview">稍后再说</button>
          <button class="preview-confirm" :disabled="!canConfirmBind" type="button" @click="submitBindCard">
            {{ isSubmitting ? '绑定中...' : '确认绑定' }}
          </button>
        </div>
      </section>
    </van-popup>
  </section>
</template>

<style scoped>
.member-cards-page {
  display: grid;
  grid-template-rows: 56px 40px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.balance-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  background: #ff6a1a;
}

.balance-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.balance-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}

.balance-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.balance-meta {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
}

.pay-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.content-area {
  display: grid;
  gap: 16px;
  align-content: start;
  padding: 20px 16px 24px;
  overflow-y: auto;
}

.intro-card,
.records-card {
  padding: 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(26, 25, 24, 0.06);
}

.intro-card {
  display: grid;
  gap: 16px;
}

.intro-card strong,
.records-header strong,
.record-main strong {
  color: #1a1918;
  font-size: 16px;
}

.intro-card p,
.record-main p,
.record-meta {
  margin: 6px 0 0;
  color: #8a7f78;
  font-size: 13px;
  line-height: 1.5;
}

.secondary-button {
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: #ff6a1a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.status-text {
  margin: 0;
  color: #8a7f78;
  font-size: 14px;
}

.records-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #8a7f78;
  font-size: 13px;
}

.record-row + .record-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1ece7;
}

.record-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.record-amount {
  color: #ff6a1a;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.empty-state {
  min-height: 280px;
}

.bind-drawer {
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  border-radius: 0;
  overflow: hidden;
  background: #fafaf8;
}

.bind-drawer-body {
  display: grid;
  grid-template-rows: 56px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: #fafaf8;
}

.bind-preview-popup {
  overflow: hidden;
  background: transparent;
}

.bind-preview-sheet {
  display: grid;
  gap: 16px;
  padding: 20px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, #fffaf5 0%, #fff 100%);
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.preview-header strong {
  color: #1a1918;
  font-size: 18px;
}

.preview-header p {
  margin: 6px 0 0;
  color: #8a7f78;
  font-size: 13px;
  line-height: 1.5;
}

.preview-close {
  padding: 0;
  border: 0;
  background: transparent;
  color: #8a7f78;
  font-size: 14px;
}

.lookup-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: #fff7f0;
  box-shadow: inset 0 0 0 1px rgba(255, 106, 26, 0.08);
}

.lookup-header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.lookup-header strong {
  color: #1a1918;
  font-size: 15px;
  font-weight: 600;
}

.lookup-status {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 106, 26, 0.12);
  color: #d15a15;
  font-size: 12px;
  font-weight: 600;
}

.lookup-status-disabled {
  background: rgba(127, 120, 114, 0.12);
  color: #7f7872;
}

.lookup-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.lookup-grid div {
  display: grid;
  gap: 4px;
}

.lookup-grid dt {
  color: #8a7f78;
  font-size: 12px;
}

.lookup-grid dd {
  margin: 0;
  color: #1a1918;
  font-size: 14px;
  font-weight: 600;
}

.mobile-field {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(26, 25, 24, 0.05);
}

.mobile-field span {
  color: #1a1918;
  font-size: 14px;
  font-weight: 600;
}

.mobile-field input {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1a1918;
  font-size: 16px;
  font-weight: 500;
  outline: none;
}

.mobile-field input::placeholder {
  color: #a69d95;
}

.mobile-hint {
  margin: -6px 2px 0;
  color: #8a7f78;
  font-size: 12px;
  line-height: 1.5;
}

.mobile-hint-error {
  color: #d15a15;
}

.preview-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.preview-cancel,
.preview-confirm {
  height: 48px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
}

.preview-cancel {
  border: 1px solid #eadfd5;
  background: #fff;
  color: #7b7068;
}

.preview-confirm {
  border: 0;
  background: #ff6a1a;
  color: #fff;
}

.preview-confirm:disabled {
  opacity: 0.56;
}
</style>
