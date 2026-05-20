<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

type CouponCardSurface = 'warm' | 'neutral'

const props = withDefaults(defineProps<{
  highlighted?: boolean
  muted?: boolean
  selected?: boolean
  smallValueSuffix?: boolean
  subtitle?: string | null
  surface?: CouponCardSurface
  tag?: string
  title: string
  value?: string | null
  valueSuffix?: string | null
}>(), {
  highlighted: false,
  muted: false,
  selected: false,
  smallValueSuffix: false,
  subtitle: null,
  surface: 'warm',
  tag: 'article',
  value: null,
  valueSuffix: null,
})
</script>

<template>
  <component
    :is="tag"
    class="coupon-card"
    :class="[
      `coupon-card-${surface}`,
      {
        'coupon-card-highlighted': highlighted,
        'coupon-card-muted': muted,
        'coupon-card-selected': selected,
      },
    ]"
    v-bind="$attrs"
  >
    <div class="coupon-card-main">
      <p class="coupon-card-title">{{ title }}</p>

      <p v-if="subtitle" class="coupon-card-subtitle">{{ subtitle }}</p>
    </div>

    <div v-if="value || valueSuffix || $slots.side" class="coupon-card-side">
      <div class="coupon-card-side-content">
        <div v-if="value || valueSuffix" class="coupon-card-value">
          <strong v-if="value">{{ value }}</strong>
          <span
            v-if="valueSuffix"
            class="coupon-card-value-suffix"
            :class="{ 'coupon-card-value-suffix-small': smallValueSuffix }"
          >
            {{ valueSuffix }}
          </span>
        </div>

        <slot name="side" />
      </div>
    </div>
  </component>
</template>

<style scoped>
.coupon-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.16);
  border-radius: 20px;
  background:
    linear-gradient(135deg, var(--color-surface-glass-solid), rgba(var(--color-primary-rgb), 0.08)),
    var(--color-surface-elevated);
  box-shadow: var(--shadow-card);
  color: inherit;
  text-align: left;
}

.coupon-card[type='button'] {
  appearance: none;
  cursor: pointer;
  font: inherit;
}

.coupon-card-neutral {
  border-color: var(--color-line-contrast);
  background: var(--color-surface-elevated);
  box-shadow: none;
}

.coupon-card-highlighted {
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.coupon-card-muted {
  opacity: 0.72;
}

.coupon-card-selected {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.coupon-card-main {
  min-width: 0;
}

.coupon-card-title {
  margin: 0;
  color: var(--color-text-heading);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.coupon-card-subtitle {
  margin: 6px 0 0;
  color: var(--color-text-soft);
  font-size: 12px;
  line-height: 1.5;
}

.coupon-card-neutral .coupon-card-title {
  color: var(--color-text);
  font-weight: 700;
}

.coupon-card-neutral .coupon-card-subtitle {
  color: var(--color-text-subtle);
}

.coupon-card-side {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
}

.coupon-card-side-content {
  display: grid;
  gap: 8px;
  justify-items: center;
}

.coupon-card-value {
  display: inline-flex;
  gap: 2px;
  align-items: baseline;
  justify-content: center;
  color: var(--color-primary-deep);
}

.coupon-card-neutral .coupon-card-value {
  color: var(--color-text);
}

.coupon-card-value strong {
  font-size: 24px;
  line-height: 1;
}

.coupon-card-neutral .coupon-card-value strong {
  font-size: 22px;
}

.coupon-card-value-suffix {
  font-size: 14px;
  line-height: 1;
}

.coupon-card-value-suffix-small {
  font-size: 11px;
}
</style>
