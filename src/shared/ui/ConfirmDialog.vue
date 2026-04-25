<script setup lang="ts">
const props = withDefaults(defineProps<{
  cancelText?: string
  confirmText?: string
  loading?: boolean
  message: string
  modelValue: boolean
  title: string
}>(), {
  cancelText: '取消',
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
    :close-on-click-overlay="!loading"
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
  background: #fff;
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
  color: #1f1d1a;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}

.dialog-message {
  margin: 0;
  color: #7b746d;
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
  background: #f5f1ec;
  color: #665f58;
}

.dialog-button-danger {
  background: #fff3f1;
  color: #d14343;
}

.dialog-button:disabled {
  opacity: 0.56;
}
</style>
