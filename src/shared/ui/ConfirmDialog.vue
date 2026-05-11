<script setup lang="ts">
const props = withDefaults(defineProps<{
  cancelText?: string
  closeOnClickOverlay?: boolean
  confirmText?: string
  loading?: boolean
  message: string
  modelValue: boolean
  title: string
}>(), {
  cancelText: '取消',
  closeOnClickOverlay: true,
  confirmText: '确认',
  loading: false,
})

const emit = defineEmits<{
  'cancel': []
  'confirm': []
  'update:modelValue': [value: boolean]
}>()

function closeDialog() {
  if (props.loading) {
    return
  }

  emit('update:modelValue', false)
}

function handleCancel() {
  if (props.loading) {
    return
  }

  emit('cancel')
  emit('update:modelValue', false)
}

function handleConfirm() {
  if (props.loading) {
    return
  }

  emit('confirm')
}

function handleModelValueUpdate(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<template>
  <van-dialog
    :show="modelValue"
    class="confirm-dialog"
    :close-on-click-overlay="closeOnClickOverlay && !loading"
    :show-cancel-button="false"
    :show-confirm-button="false"
    teleport="body"
    @update:show="handleModelValueUpdate"
    @closed="closeDialog"
  >
    <section class="dialog-content">
      <header class="dialog-head">
        <strong>{{ title }}</strong>
      </header>

      <p class="dialog-message">{{ message }}</p>

      <footer class="dialog-actions">
        <button class="dialog-button dialog-button-muted" :disabled="loading" type="button" @click="handleCancel">
          {{ cancelText }}
        </button>

        <button class="dialog-button dialog-button-danger" :disabled="loading" type="button" @click="handleConfirm">
          {{ loading ? '处理中...' : confirmText }}
        </button>
      </footer>
    </section>
  </van-dialog>
</template>

<style scoped>
.confirm-dialog {
  overflow: hidden;
  border-radius: 20px;
}

.confirm-dialog :deep(.van-dialog__content) {
  background: var(--color-surface-elevated);
}

.dialog-content {
  display: grid;
  gap: 14px;
  padding: 24px 20px 18px;
}

.dialog-head {
  display: flex;
  justify-content: center;
}

.dialog-head strong {
  color: var(--color-text-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}

.dialog-message {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
}

.dialog-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.dialog-button {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
}

.dialog-button-muted {
  background: var(--color-surface-muted);
  color: var(--color-text-subtle);
}

.dialog-button-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.dialog-button:disabled {
  opacity: 0.56;
}
</style>
