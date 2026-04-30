<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const presetReasons = ['不想要了', '拍错了', '地址写错了']
const otherReasonValue = '__other__'

const props = withDefaults(defineProps<{
  loading?: boolean
  modelValue: boolean
  title?: string
}>(), {
  loading: false,
  title: '申请退款',
})

const emit = defineEmits<{
  submit: [reason: string]
  'update:modelValue': [value: boolean]
}>()

const selectedReason = ref('')
const customReason = ref('')

const isOtherReason = computed(() => selectedReason.value === otherReasonValue)

function resetForm() {
  selectedReason.value = ''
  customReason.value = ''
}

function closeSheet() {
  if (props.loading) {
    return
  }

  emit('update:modelValue', false)
}

function handleReasonSelect(reason: string) {
  if (props.loading) {
    return
  }

  selectedReason.value = reason

  if (reason !== otherReasonValue) {
    customReason.value = ''
  }
}

function handleSubmit() {
  if (props.loading) {
    return
  }

  const reason = isOtherReason.value ? customReason.value.trim() : selectedReason.value.trim()
  emit('submit', reason)
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      resetForm()
    }
  },
)
</script>

<template>
  <van-popup
    :show="modelValue"
    class="refund-request-sheet"
    position="bottom"
    round
    teleport="body"
    @update:show="(value) => emit('update:modelValue', value)"
  >
    <section class="sheet-content">
      <header class="sheet-header">
        <strong>{{ title }}</strong>
        <button class="sheet-close-button" :disabled="loading" type="button" aria-label="关闭退款申请弹层" @click="closeSheet">
          <van-icon name="cross" size="18" />
        </button>
      </header>

      <div class="sheet-body">
        <section class="field-block">
          <strong class="field-title">退款原因</strong>

          <div class="reason-grid">
            <button
              v-for="reason in presetReasons"
              :key="reason"
              class="reason-chip"
              :class="{ 'reason-chip-active': selectedReason === reason }"
              :disabled="loading"
              type="button"
              @click="handleReasonSelect(reason)"
            >
              {{ reason }}
            </button>

            <button
              class="reason-chip"
              :class="{ 'reason-chip-active': isOtherReason }"
              :disabled="loading"
              type="button"
              @click="handleReasonSelect(otherReasonValue)"
            >
              其他
            </button>
          </div>
        </section>

        <van-field
          v-if="isOtherReason"
          v-model="customReason"
          autosize
          class="reason-textarea"
          maxlength="1000"
          rows="3"
          show-word-limit
          type="textarea"
          placeholder="请输入退款原因"
        />
      </div>

      <footer class="sheet-footer">
        <button class="footer-button footer-button-muted" :disabled="loading" type="button" @click="closeSheet">
          取消
        </button>

        <button class="footer-button footer-button-primary" :disabled="loading" type="button" @click="handleSubmit">
          {{ loading ? '提交中...' : '提交申请' }}
        </button>
      </footer>
    </section>
  </van-popup>
</template>

<style scoped>
.refund-request-sheet {
  overflow: hidden;
  border-radius: 24px 24px 0 0;
}

.sheet-content {
  display: grid;
  gap: 18px;
  padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
  background: #fffaf4;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sheet-header strong {
  color: #1f1d1a;
  font-size: 18px;
  font-weight: 700;
}

.sheet-close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #f6efe7;
  color: #8c857d;
}

.sheet-body,
.field-block {
  display: grid;
  gap: 12px;
}

.field-title {
  color: #3c3b39;
  font-size: 14px;
  font-weight: 600;
}

.reason-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reason-chip {
  min-width: 88px;
  min-height: 36px;
  padding: 0 16px;
  border: 1px solid #eadbc8;
  border-radius: 999px;
  background: #fff;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
}

.reason-chip-active {
  border-color: #ea580c;
  background: #fff2e8;
  color: #c2410c;
}

.reason-textarea {
  overflow: hidden;
  border-radius: 16px;
}

.reason-textarea :deep(.van-field__control) {
  min-height: 88px;
}

.sheet-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.footer-button {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
}

.footer-button-muted {
  background: #f6efe7;
  color: #6d6c6a;
}

.footer-button-primary {
  background: #ea580c;
  color: #fff;
}

.sheet-close-button:disabled,
.reason-chip:disabled,
.footer-button:disabled {
  opacity: 0.56;
}
</style>
