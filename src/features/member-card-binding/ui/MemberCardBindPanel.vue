<script setup lang="ts">
import { computed } from 'vue'

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
}>()

const emit = defineEmits<{
  (e: 'preview'): void
  (e: 'scan'): void
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
const canPreview = computed(() => !isBusy.value)
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
      <section class="scan-section">
        <button class="scan-button" :disabled="isBusy" type="button" @click="emit('scan')">
          <van-icon name="scan" size="108" />
        </button>
        <strong>{{ isSubmitting ? '绑定中...' : isLookingUp ? '读取中...' : '扫码读取卡券' }}</strong>
        <p>扫码或手动填写卡券信息后，会先弹出预览窗口，再完成绑定充值。</p>
      </section>

      <div class="action-area">
        <button class="primary-button" :disabled="!canPreview" type="button" @click="emit('preview')">
          {{ isSubmitting ? '绑定中...' : isLookingUp ? '读取中...' : '确认信息' }}
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
  border-bottom: 1px solid var(--color-line-contrast);
  background: var(--color-surface-elevated);
}

.card-input-row span {
  flex: none;
  white-space: nowrap;
  color: var(--color-text-strong);
  font-size: 14px;
  font-weight: 500;
}

.card-input-row input {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-strong);
  font-size: 14px;
  font-weight: 500;
  outline: none;
}

.card-input-row input::placeholder {
  color: var(--color-text-muted);
}

.bind-body {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
  padding: 28px 20px 24px;
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
  background: linear-gradient(180deg, var(--color-surface-accent) 0%, var(--color-primary-soft-strong) 100%);
  color: var(--color-primary-alt);
}

.scan-button:disabled {
  opacity: 0.72;
}

.scan-section strong {
  color: var(--color-warning);
  font-size: 18px;
  font-weight: 600;
}

.scan-section p {
  margin: 0;
  max-width: 240px;
  color: var(--color-text-subtle);
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
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 14px;
  background: var(--color-surface-elevated);
  color: var(--color-primary-alt);
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
  background: var(--color-primary-alt);
  color: var(--color-text-inverse);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 1px 6px rgba(var(--shadow-rgb), 0.08);
}

.primary-button:disabled {
  opacity: 0.72;
}
</style>
