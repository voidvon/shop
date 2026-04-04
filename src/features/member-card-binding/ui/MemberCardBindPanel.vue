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
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
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
        placeholder="请输入12-14位卡券编号，如 DG2026000001"
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
        <button class="scan-button" :disabled="isSubmitting" type="button" @click="emit('simulate-scan')">
          <van-icon name="scan" size="108" />
        </button>
        <strong>{{ isSubmitting ? '绑定中...' : '扫码绑定卡券' }}</strong>
        <p>点击扫码后会自动读取卡券信息，并完成绑定充值。</p>
      </section>

      <div class="action-area">
        <button class="primary-button" :disabled="isSubmitting" type="button" @click="emit('submit')">
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
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
  padding: 28px 20px 24px;
}

.scan-section {
  display: grid;
  gap: 14px;
  justify-items: center;
  align-content: start;
  padding-top: 24px;
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
  gap: 24px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
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
