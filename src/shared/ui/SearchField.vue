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
  (e: 'update:modelValue', value: string): void
}>()

const internalValue = ref(props.modelValue)

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
</script>

<template>
  <label class="search-field" :class="`search-field-${variant}`" :aria-label="ariaLabel">
    <van-icon name="search" :size="iconSize" />
    <input
      v-model="value"
      class="search-field-input"
      :readonly="readonly"
      :type="type"
      :placeholder="placeholder"
      @change="handleChange"
    >
  </label>
</template>

<style scoped>
.search-field {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #9c9b99;
}

.search-field-input {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3c3b39;
  outline: none;
}

.search-field-input::placeholder {
  color: var(--van-field-placeholder-text-color);
}

.search-field-filled {
  height: 48px;
  padding: 0 16px;
  border-radius: 12px;
  background: #fff;
}

.search-field-filled .search-field-input {
  font-size: 14px;
  font-weight: 500;
}

.search-field-outlined {
  min-height: 48px;
  padding: 14px 16px;
  border: 1px solid #e7e5e4;
  border-radius: 14px;
  background: #fff;
  color: #a8a29e;
}

.search-field-outlined .search-field-input {
  font-size: 14px;
  font-weight: 500;
}

.search-field-soft {
  height: 36px;
  padding: 0 12px;
  border-radius: 18px;
  background: #f5f4f1;
}

.search-field-soft .search-field-input {
  font-size: 13px;
  font-weight: 500;
}
</style>
