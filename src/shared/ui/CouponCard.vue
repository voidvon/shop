<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

type CouponCardSurface = 'warm' | 'neutral'

const props = withDefaults(defineProps<{
  headline: string
  highlighted?: boolean
  metaItems?: string[]
  muted?: boolean
  selected?: boolean
  surface?: CouponCardSurface
  tag?: string
  title?: string | null
}>(), {
  highlighted: false,
  metaItems: () => [],
  muted: false,
  selected: false,
  surface: 'warm',
  tag: 'article',
  title: null,
})

const normalizedMetaItems = computed(() =>
  props.metaItems.filter((item) => item.trim().length > 0),
)

const displayTitle = computed(() => props.title ?? props.headline)
const displayValue = computed(() => (props.title ? props.headline : null))
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
      <div class="coupon-card-summary">
        <p class="coupon-card-title">{{ displayTitle }}</p>
        <strong v-if="displayValue">{{ displayValue }}</strong>
      </div>

      <div v-if="normalizedMetaItems.length > 0" class="coupon-card-meta">
        <span v-for="item in normalizedMetaItems" :key="item">{{ item }}</span>
      </div>
    </div>

    <div v-if="$slots.side" class="coupon-card-side">
      <slot name="side" />
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
  border: 1px solid rgba(240, 138, 62, 0.16);
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 238, 0.98));
  box-shadow: 0 10px 24px rgba(188, 119, 60, 0.08);
  color: inherit;
  text-align: left;
}

.coupon-card[type='button'] {
  appearance: none;
  cursor: pointer;
  font: inherit;
}

.coupon-card-neutral {
  border-color: #efe3d6;
  background: #fff;
  box-shadow: none;
}

.coupon-card-highlighted {
  border-color: rgba(240, 138, 62, 0.2);
}

.coupon-card-muted {
  opacity: 0.72;
}

.coupon-card-selected {
  outline: 2px solid #f97316;
  outline-offset: -2px;
}

.coupon-card-main {
  min-width: 0;
}

.coupon-card-summary {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
}

.coupon-card-title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  color: #47362c;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.coupon-card-main strong {
  flex: none;
  color: #c25b0a;
  font-size: 24px;
  line-height: 1.1;
  text-align: right;
}

.coupon-card-neutral .coupon-card-title {
  color: #2f2a24;
  font-weight: 700;
}

.coupon-card-neutral .coupon-card-main strong {
  color: #2f2a24;
  font-size: 22px;
}

.coupon-card-meta {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  color: #8a6f5b;
  font-size: 12px;
  line-height: 1.5;
}

.coupon-card-neutral .coupon-card-meta {
  color: #887d70;
}

.coupon-card-side {
  display: flex;
  flex: none;
  align-items: center;
}
</style>
