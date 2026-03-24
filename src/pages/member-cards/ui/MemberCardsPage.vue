<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { MemberCardBindPanel, useMemberCardBinding } from '@/features/member-card-binding'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCardsPageModel } from '../model/useMemberCardsPageModel'

const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const cardNumber = ref('')
const cardSecret = ref('')
const { bindMemberCard } = useMemberCardBinding()
const { errorMessage, isLoading, loadMemberCardsPage, memberCardsPageData } = useMemberCardsPageModel()
const bindDrawerVisible = computed(() => route.query.drawer === 'bind')
const devCardNumber = import.meta.env.VITE_DEV_MEMBER_CARD_NO?.trim() ?? ''
const devCardSecret = import.meta.env.VITE_DEV_MEMBER_CARD_SECRET?.trim() ?? ''

function formatAmount(amount: number) {
  return amount.toFixed(2)
}

function maskCardNumber(cardNumberValue: string) {
  return cardNumberValue.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2')
}

function resolveSimulatedCardNumber() {
  return devCardNumber || cardNumber.value
}

function resolveSimulatedCardSecret() {
  return devCardSecret || cardSecret.value
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

async function submitBindCard() {
  isSubmitting.value = true

  try {
    const result = await bindMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
    })
    showSuccessToast(`充值成功，到账 ¥${formatAmount(result.redemption.amount)}`)
    await closeBindDrawer()
    await loadMemberCardsPage()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '卡券充值失败')
  } finally {
    isSubmitting.value = false
  }
}

async function simulateScan() {
  const simulatedCardNumber = resolveSimulatedCardNumber()
  const simulatedCardSecret = resolveSimulatedCardSecret()

  if (!simulatedCardNumber) {
    showFailToast('未读取到卡券编号，请手动输入后重试')
    return
  }

  cardNumber.value = simulatedCardNumber
  cardSecret.value = simulatedCardSecret

  if (!simulatedCardSecret) {
    showFailToast('未读取到卡券卡密，请手动输入后重试')
    return
  }

  showSuccessToast('已读取卡券信息，正在提交绑定')
  await submitBindCard()
}

watch(bindDrawerVisible, (visible, previousVisible) => {
  if (visible || !previousVisible) {
    return
  }

  cardNumber.value = ''
  cardSecret.value = ''
})

onMounted(async () => {
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
        <span class="balance-label">账户余额</span>
        <span class="balance-pill">¥ {{ formatAmount(memberCardsPageData.balanceAmount) }}</span>
      </div>

      <button class="pay-link" type="button" @click="goToBalanceDetail">余额明细</button>
    </section>

    <div class="content-area">
      <section class="intro-card">
        <div>
          <strong>扫码绑定卡券并充值</strong>
          <p>绑定动作会读取卡券编号，提交后端充值，成功后在下方生成兑换记录。</p>
        </div>
        <button class="secondary-button" type="button" @click="goToBindCard">绑定新卡</button>
      </section>

      <p v-if="isLoading" class="status-text">卡券记录加载中...</p>

      <section v-else-if="memberCardsPageData.redemptionRecords.length > 0" class="records-card">
        <header class="records-header">
          <strong>兑换记录</strong>
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
            <span>兑换码 {{ record.redeemedCode }}</span>
            <time :datetime="record.occurredAt">{{ record.occurredAt }}</time>
          </div>
        </article>
      </section>

      <EmptyState
        v-else
        boxed
        class="empty-state"
        description="绑定充值后，这里会展示你的卡券兑换记录。"
        description-width="248px"
        icon="coupon-o"
        :icon-size="40"
        title="暂无兑换记录"
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
          :is-submitting="isSubmitting"
          @simulate-scan="simulateScan"
          @submit="submitBindCard"
        />
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
</style>
