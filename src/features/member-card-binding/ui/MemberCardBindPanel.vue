<script setup lang="ts">
import { computed } from 'vue'
import type { LookupMemberCardResult } from '@/processes/member-center'

import {
  memberCardNumberLengthRange,
  memberCardSecretLengthRange,
  normalizeMemberCardNumber,
  normalizeMemberCardSecret,
} from '@/processes/member-center/domain/member-card-bind-rules'

const props = defineProps<{
  cardNumber: string
  cardSecret: string
  isLookingUp?: boolean
  isSubmitting?: boolean
  lookupResult?: LookupMemberCardResult | null
}>()

const emit = defineEmits<{
  (e: 'lookup'): void
  (e: 'simulate-scan'): void
  (e: 'submit'): void
  (e: 'update:cardNumber', value: string): void
  (e: 'update:cardSecret', value: string): void
}>()

const cardNumberModel = computed({
  get: () => props.cardNumber,
  set: (value: string) => emit('update:cardNumber', normalizeMemberCardNumber(value)),
})

const cardSecretModel = computed({
  get: () => props.cardSecret,
  set: (value: string) => emit('update:cardSecret', normalizeMemberCardSecret(value)),
})

const isBusy = computed(() => props.isSubmitting || props.isLookingUp)
const canSubmit = computed(() => !isBusy.value && (props.lookupResult?.canBind ?? true))

function formatAmount(amount: number) {
  return amount.toFixed(2)
}
</script>

<template>
  <div class="bind-panel">
    <label class="card-input-row">
      <span>卡券编号</span>
      <input
        v-model="cardNumberModel"
        type="text"
        autocapitalize="characters"
        :maxlength="memberCardNumberLengthRange.max"
        placeholder="请输入12-17位卡券编号，如 GENERAL2026000001"
      >
    </label>

    <label class="card-input-row">
      <span>卡券卡密</span>
      <input
        v-model="cardSecretModel"
        type="text"
        :maxlength="memberCardSecretLengthRange.max"
        placeholder="请输入6-8位卡券卡密，如 pkoz87"
      >
    </label>

    <div class="bind-body">
      <section v-if="lookupResult" class="lookup-card">
        <div class="lookup-header">
          <strong>{{ lookupResult.balanceTypeName || '储值卡信息' }}</strong>
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

      <section class="scan-section">
        <button class="scan-button" :disabled="isBusy" type="button" @click="emit('simulate-scan')">
          <van-icon name="scan" size="108" />
        </button>
        <strong>{{ isSubmitting ? '绑定中...' : isLookingUp ? '查询中...' : '扫码读取卡券' }}</strong>
        <p>点击扫码后会自动读取卡券信息，并优先查询卡状态与余额。</p>
      </section>

      <div class="action-area">
        <button class="secondary-button" :disabled="isBusy" type="button" @click="emit('lookup')">
          {{ isLookingUp ? '查询中...' : '查询卡信息' }}
        </button>
        <button class="primary-button" :disabled="!canSubmit" type="button" @click="emit('submit')">
          {{ isSubmitting ? '充值中...' : '确认绑定并充值' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bind-panel {
  display: grid;
  grid-template-rows: 48px 48px minmax(0, 1fr);
  min-height: 0;
}

.card-input-row {
  display: flex;
  gap: 20px;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #e5e4e1;
  background: #fff;
}

.card-input-row span {
  flex: none;
  white-space: nowrap;
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
}

.card-input-row input {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
  outline: none;
}

.card-input-row input::placeholder {
  color: #9c9b99;
}

.bind-body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 0;
  padding: 28px 20px 24px;
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

.scan-section {
  display: grid;
  gap: 14px;
  justify-items: center;
  align-content: start;
  padding-top: 20px;
  text-align: center;
}

.scan-button {
  display: grid;
  place-items: center;
  width: 168px;
  height: 168px;
  border: 0;
  border-radius: 28px;
  background: linear-gradient(180deg, #fff3eb 0%, #ffe5d3 100%);
  color: #ff6a1a;
}

.scan-button:disabled {
  opacity: 0.72;
}

.scan-section strong {
  color: #d89575;
  font-size: 18px;
  font-weight: 600;
}

.scan-section p {
  margin: 0;
  max-width: 240px;
  color: #9c7f70;
  font-size: 13px;
  line-height: 1.5;
}

.action-area {
  display: grid;
  gap: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

.secondary-button {
  width: 100%;
  height: 52px;
  border: 1px solid rgba(255, 106, 26, 0.2);
  border-radius: 14px;
  background: #fff;
  color: #ff6a1a;
  font-size: 16px;
  font-weight: 600;
}

.secondary-button:disabled {
  opacity: 0.72;
}

.primary-button {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 14px;
  background: #ff6a1a;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 1px 6px rgba(26, 25, 24, 0.08);
}

.primary-button:disabled {
  opacity: 0.72;
}
</style>
