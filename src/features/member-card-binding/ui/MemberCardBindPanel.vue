<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  cardNumber: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'simulate-scan'): void
  (e: 'submit'): void
  (e: 'update:cardNumber', value: string): void
}>()

const cardNumberModel = computed({
  get: () => props.cardNumber,
  set: (value: string) => emit('update:cardNumber', value.replace(/\D/g, '').slice(0, 16)),
})
</script>

<template>
  <div class="bind-panel">
    <label class="card-no-row">
      <span>卡券编号</span>
      <input
        v-model="cardNumberModel"
        type="text"
        inputmode="numeric"
        maxlength="16"
        placeholder="扫码后自动回填16位卡券编号"
      >
    </label>

    <div class="bind-body">
      <section class="scan-section">
        <button class="scan-button" type="button" @click="emit('simulate-scan')">
          <van-icon name="scan" size="108" />
        </button>
        <strong>扫码读取卡券编号</strong>
        <p>当前联调版本会模拟扫码结果，并将卡券编号提交到后端充值。</p>
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
  grid-template-rows: 48px minmax(0, 1fr);
  min-height: 0;
}

.card-no-row {
  display: flex;
  gap: 20px;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #e5e4e1;
  background: #fff;
}

.card-no-row span {
  flex: none;
  white-space: nowrap;
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
}

.card-no-row input {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
  outline: none;
}

.card-no-row input::placeholder {
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
