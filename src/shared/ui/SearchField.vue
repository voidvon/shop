<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type SearchFieldVariant = 'filled' | 'outlined' | 'soft'

const props = withDefaults(defineProps<{
  ariaLabel?: string
  iconSize?: number
  modelValue?: string
  placeholder: string
  readonly?: boolean
  type?: 'search' | 'text'
  variant?: SearchFieldVariant
}>(), {
  ariaLabel: '搜索',
  iconSize: 20,
  modelValue: '',
  readonly: false,
  type: 'search',
  variant: 'filled',
})

const emit = defineEmits<{
  (e: 'change', value: string): void
  (e: 'click'): void
  (e: 'submit', value: string): void
  (e: 'update:modelValue', value: string): void
}>()

const internalValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  (nextValue) => {
    internalValue.value = nextValue
  },
)

const value = computed({
  get: () => internalValue.value,
  set: (nextValue: string) => {
    internalValue.value = nextValue
    emit('update:modelValue', nextValue)
  },
})

function handleChange() {
  emit('change', value.value)
}

function handleClick() {
  emit('click')
}

function handleSubmit() {
  emit('submit', value.value)
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({
  focus,
})
</script>

<template>
  <label
    class="search-field"
    :class="`search-field-${variant}`"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <van-icon name="search" :size="iconSize" />
    <input
      ref="inputRef"
      v-model="value"
      class="search-field-input"
      :readonly="readonly"
      :type="type"
      :placeholder="placeholder"
      @change="handleChange"
      @keydown.enter="handleSubmit"
    >
  </label>
</template>

<style scoped>
.search-field {
  display: flex;
  gap: 12px;
  align-items: center;
  color: var(--color-text-muted);
}

.search-field-input {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  color: var(--color-text);
  outline: none;
}

.search-field-input::placeholder {
  color: var(--van-field-placeholder-text-color);
}

.search-field-input::-webkit-search-decoration,
.search-field-input::-webkit-search-cancel-button,
.search-field-input::-webkit-search-results-button,
.search-field-input::-webkit-search-results-decoration {
  display: none;
}

.search-field-filled {
  height: 48px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--color-surface-elevated);
}

.search-field-filled .search-field-input {
  font-size: 14px;
  font-weight: 500;
}

.search-field-outlined {
  min-height: 48px;
  padding: 14px 16px;
  border: 1px solid var(--color-line-contrast);
  border-radius: 14px;
  background: var(--color-surface-elevated);
  color: var(--color-text-faint);
}

.search-field-outlined .search-field-input {
  font-size: 14px;
  font-weight: 500;
}

.search-field-soft {
  height: 36px;
  padding: 0 12px;
  border-radius: 18px;
  background: var(--color-surface-muted);
}

.search-field-soft .search-field-input {
  font-size: 13px;
  font-weight: 500;
}
</style>
