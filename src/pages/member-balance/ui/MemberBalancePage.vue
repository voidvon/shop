<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast, showToast } from 'vant'

import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberBalancePageModel } from '../model/useMemberBalancePageModel'

const router = useRouter()
const {
  createWechatRecharge,
  errorMessage,
  isLoading,
  isRechargeOptionsLoading,
  isRechargeSubmitting,
  loadMemberBalancePage,
  loadRechargeOptions,
  memberBalancePageData,
  rechargeErrorMessage,
  rechargeOptions,
} = useMemberBalancePageModel()
const rechargePopupVisible = ref(false)
const selectedAmount = ref<number | null>(null)
const customAmount = ref<string | number>('')

const rechargeAmounts = computed(() => rechargeOptions.value?.amounts ?? [])
const customAmountRule = computed(() => rechargeOptions.value?.customAmount ?? {
  enabled: false,
  max: 0,
  min: 0,
})
const canUseCustomAmount = computed(() => customAmountRule.value.enabled)
const rechargeButtonDisabled = computed(() => isRechargeOptionsLoading.value || isRechargeSubmitting.value)
const submitButtonText = computed(() => {
  if (isRechargeSubmitting.value) {
    return '支付中...'
  }

  return '立即充值'
})

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

function formatRechargeAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function selectRechargeAmount(amount: number) {
  selectedAmount.value = amount
  customAmount.value = ''
}

function normalizeCustomAmountText(value = customAmount.value) {
  return String(value ?? '').trim()
}

function normalizeInputAmount(value: string | number) {
  const parsedValue = Number.parseFloat(String(value))
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function resolveRechargeAmount() {
  const customAmountText = normalizeCustomAmountText()

  if (customAmountText) {
    return normalizeInputAmount(customAmountText)
  }

  return selectedAmount.value ?? 0
}

function validateRechargeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return '请选择或输入充值金额'
  }

  if (normalizeCustomAmountText() && canUseCustomAmount.value) {
    const { max, min } = customAmountRule.value

    if (amount < min) {
      return `自定义金额不能低于 ${formatRechargeAmount(min)} 元`
    }

    if (amount > max) {
      return `自定义金额不能高于 ${formatRechargeAmount(max)} 元`
    }
  }

  return null
}

function showAmountRangeToast(message: string) {
  showToast({
    className: 'member-balance-auto-width-toast',
    message,
    type: 'text',
  })
}

async function openRechargePopup() {
  rechargePopupVisible.value = true

  if (!rechargeOptions.value) {
    await loadRechargeOptions()
  }
}

function closeRechargePopup() {
  if (isRechargeSubmitting.value) {
    return
  }

  rechargePopupVisible.value = false
}

async function submitRecharge() {
  const amount = resolveRechargeAmount()
  const validationMessage = validateRechargeAmount(amount)

  if (validationMessage) {
    if (validationMessage.startsWith('自定义金额不能')) {
      showAmountRangeToast(validationMessage)
    } else {
      showFailToast(validationMessage)
    }

    return
  }

  try {
    await createWechatRecharge(amount)
    showSuccessToast('充值成功')
    rechargePopupVisible.value = false
    selectedAmount.value = null
    customAmount.value = ''
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '充值失败')
  }
}

onMounted(() => {
  void loadMemberBalancePage()
})

onActivated(() => {
  void loadMemberBalancePage()
})

watch(customAmount, (value) => {
  if (normalizeCustomAmountText(value)) {
    selectedAmount.value = null
  }
})
</script>

<template>
  <section class="member-balance-page">
    <PageTopBar title="账户余额" @back="goBack" />

    <div class="content-scroll">
      <section class="hero-card">
        <div class="hero-main">
          <span class="hero-label">总可用余额</span>
          <strong>¥ {{ formatAmount(memberBalancePageData.balanceAmount) }}</strong>
        </div>

        <button class="recharge-button" type="button" @click="openRechargePopup">
          充值
        </button>
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

    <van-popup
      v-model:show="rechargePopupVisible"
      class="recharge-popup"
      position="bottom"
      round
      teleport="body"
    >
      <section class="recharge-sheet">
        <header class="recharge-sheet-head">
          <div>
            <strong>余额充值</strong>
            <p>充值金额将通过微信支付入账到账户余额。</p>
          </div>

          <button class="sheet-close-button" type="button" aria-label="关闭充值面板" @click="closeRechargePopup">
            <van-icon name="cross" size="18" />
          </button>
        </header>

        <div class="recharge-sheet-body">
          <p v-if="rechargeErrorMessage" class="recharge-error">{{ rechargeErrorMessage }}</p>
          <van-skeleton
            v-if="isRechargeOptionsLoading"
            :animate="false"
            class="recharge-options-skeleton"
          >
            <template #template>
              <div class="amount-grid">
                <van-skeleton-title
                  v-for="index in 6"
                  :key="index"
                  class="amount-option-skeleton"
                  title-width="100%"
                />
              </div>

              <div class="custom-amount-skeleton">
                <van-skeleton-title class="custom-amount-label-skeleton" title-width="70px" />
                <van-skeleton-title class="custom-amount-input-skeleton" title-width="100%" />
              </div>

              <van-skeleton-title class="custom-amount-tip-skeleton" title-width="138px" />
            </template>
          </van-skeleton>

          <template v-else>
            <div v-if="rechargeAmounts.length > 0" class="amount-grid">
              <button
                v-for="amount in rechargeAmounts"
                :key="amount"
                :class="['amount-option', { 'amount-option-active': selectedAmount === amount }]"
                type="button"
                @click="selectRechargeAmount(amount)"
              >
                <strong>{{ formatRechargeAmount(amount) }}</strong>
                <span>元</span>
              </button>
            </div>

            <label v-if="canUseCustomAmount" class="custom-amount-field">
              <span>自定义金额</span>
              <input
                v-model="customAmount"
                :max="customAmountRule.max"
                :min="customAmountRule.min"
                inputmode="decimal"
                placeholder="请输入充值金额"
                type="number"
              >
            </label>

            <p v-if="canUseCustomAmount" class="custom-amount-tip">
              支持 {{ formatRechargeAmount(customAmountRule.min) }}-{{ formatRechargeAmount(customAmountRule.max) }} 元
            </p>
          </template>
        </div>

        <footer class="recharge-sheet-footer">
          <button
            class="submit-recharge-button"
            :disabled="rechargeButtonDisabled"
            type="button"
            @click="submitRecharge"
          >
            {{ submitButtonText }}
          </button>
        </footer>
      </section>
    </van-popup>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
  padding: 20px 18px;
  background: linear-gradient(135deg, var(--color-primary-alt) 0%, var(--color-primary) 100%);
}

.hero-main {
  display: grid;
  min-width: 0;
  gap: 8px;
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

.recharge-button {
  flex: 0 0 auto;
  min-width: 70px;
  min-height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.56);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: var(--color-text-inverse);
  font-size: 14px;
  font-weight: 700;
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

.recharge-popup {
  background: var(--color-surface-elevated);
}

.recharge-sheet {
  display: grid;
  max-height: min(76vh, 620px);
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.recharge-sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 18px 10px;
}

.recharge-sheet-head strong {
  color: var(--color-text-heading);
  font-size: 18px;
}

.recharge-sheet-head p {
  margin: 6px 0 0;
  color: var(--color-text-subtle);
  font-size: 12px;
  line-height: 1.5;
}

.sheet-close-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--color-surface-soft);
  color: var(--color-text-subtle);
}

.recharge-sheet-body {
  min-height: 0;
  padding: 8px 18px 14px;
  overflow-y: auto;
}

.recharge-error {
  margin: 0 0 12px;
  border: 1px solid rgba(220, 38, 38, 0.18);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(220, 38, 38, 0.08);
  color: var(--color-danger);
  font-size: 13px;
  line-height: 1.5;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.amount-option {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 1px solid var(--color-line-soft);
  border-radius: 10px;
  background: var(--color-surface-elevated);
  color: var(--color-text-strong);
}

.recharge-options-skeleton {
  display: block;
  padding: 0;
}

.amount-option-skeleton {
  height: 58px;
  border-radius: 10px;
}

.amount-option strong {
  font-size: 20px;
  line-height: 1;
}

.amount-option span {
  font-size: 12px;
  line-height: 1;
}

.amount-option-active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
}

.custom-amount-field {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.custom-amount-skeleton {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.custom-amount-field span {
  color: var(--color-text-heading);
  font-size: 14px;
  font-weight: 700;
}

.custom-amount-label-skeleton {
  height: 20px;
  border-radius: 10px;
}

.custom-amount-field input {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--color-line-soft);
  border-radius: 10px;
  padding: 0 12px;
  background: var(--color-surface-elevated);
  color: var(--color-text-strong);
  font-size: 16px;
}

.custom-amount-input-skeleton {
  height: 44px;
  border-radius: 10px;
}

.custom-amount-tip {
  margin: 8px 0 0;
  color: var(--color-text-subtle);
  font-size: 12px;
}

.custom-amount-tip-skeleton {
  height: 17px;
  margin-top: 8px;
  border-radius: 10px;
}

.recharge-sheet-footer {
  padding: 12px 18px max(18px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-line-soft);
}

.submit-recharge-button {
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 16px;
  font-weight: 700;
}

.submit-recharge-button:disabled {
  opacity: 0.56;
}

:global(.member-balance-auto-width-toast) {
  width: auto;
  min-width: 0;
  max-width: calc(100vw - 48px);
  padding-right: 14px;
  padding-left: 14px;
  white-space: nowrap;
}
</style>
