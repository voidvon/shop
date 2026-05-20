<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberBalancePageModel } from '../model/useMemberBalancePageModel'

const router = useRouter()
const { errorMessage, isLoading, loadMemberBalancePage, memberBalancePageData } = useMemberBalancePageModel()

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member-cards' })
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

onMounted(() => {
  void loadMemberBalancePage()
})

onActivated(() => {
  void loadMemberBalancePage()
})
</script>

<template>
  <section class="member-balance-page">
    <PageTopBar title="账户余额" @back="goBack" />

    <div class="content-scroll">
      <section class="hero-card">
        <span class="hero-label">总可用余额</span>
        <strong>¥ {{ formatAmount(memberBalancePageData.balanceAmount) }}</strong>
      </section>

      <p v-if="errorMessage" class="status-text">{{ errorMessage }}</p>
      <LoadingState v-else-if="isLoading" />

      <section v-else class="accounts-card">
        <header class="card-head">
          <strong>余额账户</strong>
          <span>{{ memberBalancePageData.balanceAccounts.length }} 个账户</span>
        </header>

        <div
          v-for="account in memberBalancePageData.balanceAccounts"
          :key="account.accountId"
          class="account-row"
        >
          <div class="account-copy">
            <strong>{{ account.balanceTypeName }}</strong>
            <span v-if="account.frozenAmount > 0">冻结 ¥{{ formatAmount(account.frozenAmount) }}</span>
            <span v-else>可用于指定商品结算</span>
          </div>
          <strong class="account-amount">¥{{ formatAmount(account.availableAmount) }}</strong>
        </div>
      </section>

      <section v-if="memberBalancePageData.balanceLogs.length > 0" class="log-card">
        <header class="card-head">
          <strong>余额明细</strong>
          <span>最近 {{ memberBalancePageData.balanceLogs.length }} 笔</span>
        </header>

        <div v-for="log in memberBalancePageData.balanceLogs" :key="log.id" class="log-row">
          <div class="log-copy">
            <strong>{{ log.description }}</strong>
            <span>{{ log.occurredAt }}</span>
          </div>

          <strong :class="['log-amount', log.direction === 'income' ? 'log-income' : 'log-expense']">
            {{ log.direction === 'income' ? '+' : '-' }}{{ formatAmount(log.amount) }}
          </strong>
        </div>
      </section>

      <EmptyState
        v-else
        boxed
        class="empty-state"
        description="当前还没有余额流水，后续充值或订单扣款后会展示在这里。"
        description-width="240px"
        icon="balance-o"
        title="暂无余额明细"
      />
    </div>
  </section>
</template>

<style scoped>
.member-balance-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(180deg, var(--color-surface-accent-strong) 0%, var(--color-surface-soft) 100%);
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 16px 24px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.hero-card,
.accounts-card,
.log-card {
  border-radius: 20px;
  background: var(--color-surface-elevated);
  box-shadow: 0 12px 28px rgba(var(--shadow-rgb), 0.06);
}

.hero-card {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  padding: 20px 18px;
  background: linear-gradient(135deg, var(--color-primary-alt) 0%, var(--color-primary) 100%);
}

.hero-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.hero-card strong {
  color: var(--color-text-inverse);
  font-size: 32px;
  line-height: 1;
}

.status-text {
  margin: 0;
  padding: 18px 0;
  color: var(--color-text-subtle);
  font-size: 13px;
  text-align: center;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 6px;
}

.card-head strong {
  color: var(--color-text-heading);
  font-size: 16px;
}

.card-head span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.accounts-card {
  margin-bottom: 12px;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
}

.account-row + .account-row {
  border-top: 1px solid var(--color-line-soft);
}

.account-copy {
  display: grid;
  gap: 4px;
}

.account-copy strong {
  color: var(--color-text-strong);
  font-size: 14px;
}

.account-copy span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.account-amount {
  color: var(--color-primary);
  font-size: 16px;
}

.log-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
}

.log-row + .log-row {
  border-top: 1px solid var(--color-line-soft);
}

.log-copy {
  display: grid;
  gap: 4px;
}

.log-copy strong {
  color: var(--color-text-strong);
  font-size: 14px;
}

.log-copy span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.log-amount {
  font-size: 15px;
}

.log-income {
  color: var(--color-success);
}

.log-expense {
  color: var(--color-primary-deep);
}

.empty-state {
  margin-top: 12px;
}
</style>
