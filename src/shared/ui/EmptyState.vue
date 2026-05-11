<script setup lang="ts">
import { computed } from 'vue'

type EmptyStateLayout = 'default' | 'fill'
type EmptyStateSize = 'default' | 'compact'

const props = withDefaults(defineProps<{
  boxed?: boolean
  boxSize?: number
  description: string
  descriptionWidth?: string
  icon: string
  iconSize?: number
  layout?: EmptyStateLayout
  size?: EmptyStateSize
  title: string
}>(), {
  boxed: false,
  boxSize: 132,
  descriptionWidth: undefined,
  iconSize: 28,
  layout: 'default',
  size: 'default',
})

const rootStyle = computed(() => ({
  '--empty-description-width': props.descriptionWidth ?? 'auto',
  '--empty-box-size': `${props.boxSize}px`,
}))
</script>

<template>
  <section
    class="empty-state"
    :class="[`empty-state-${size}`, `empty-state-layout-${layout}`]"
    :style="rootStyle"
  >
    <div v-if="boxed" class="empty-illustration">
      <van-icon :name="icon" :size="iconSize" />
    </div>
    <van-icon v-else :name="icon" :size="iconSize" class="empty-icon" />
    <strong>{{ title }}</strong>
    <p>{{ description }}</p>
  </section>
</template>

<style scoped>
.empty-state {
  display: grid;
  justify-items: center;
  text-align: center;
}

.empty-state-layout-fill {
  min-height: 100%;
  align-content: center;
}

.empty-state-default {
  gap: 14px;
}

.empty-state-compact {
  gap: 10px;
}

.empty-illustration {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--empty-box-size);
  height: var(--empty-box-size);
  border: 1px solid var(--color-line-contrast);
  border-radius: 24px;
  background: var(--color-surface-elevated);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  color: var(--color-text-disabled);
}

.empty-state strong {
  color: var(--color-text-subtle);
}

.empty-state p {
  width: var(--empty-description-width);
  margin: 0;
}

.empty-state-default strong {
  font-size: 18px;
  font-weight: 600;
}

.empty-state-default p {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}

.empty-state-compact strong {
  color: var(--color-text-faint);
  font-size: 14px;
  font-weight: 600;
}

.empty-state-compact p {
  color: var(--color-text-disabled);
  font-size: 12px;
  font-weight: 500;
}
</style>
