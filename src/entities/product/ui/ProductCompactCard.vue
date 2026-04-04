<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

import { formatCurrency } from '@/shared/lib/currency'

const props = withDefaults(defineProps<{
  imageUrl?: string | null
  isFavorited?: boolean
  marketPrice?: number | null
  monthlySales?: number
  name: string
  price: number
  to: RouteLocationRaw
}>(), {
  imageUrl: null,
  isFavorited: false,
  marketPrice: null,
  monthlySales: 0,
})

const resolvedImageUrl = computed(() => props.imageUrl || '/images/image-placeholder.svg')
</script>

<template>
  <RouterLink class="product-compact-card" :to="to">
    <span v-if="isFavorited" class="favorite-badge">
      <van-icon name="like" size="12" />
      已收藏
    </span>

    <img class="product-image" :src="resolvedImageUrl" :alt="name">

    <div class="name-wrapper">
      <strong>{{ name }}</strong>
    </div>

    <div class="price-row">
      <span>{{ formatCurrency(price) }}</span>
      <small v-if="marketPrice">{{ formatCurrency(marketPrice) }}</small>
      <b class="sales-inline">销量 {{ monthlySales }}</b>
    </div>
  </RouterLink>
</template>

<style scoped>
.product-compact-card {
  position: relative;
  display: grid;
  gap: 8px;
  padding: 0 0 8px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  color: inherit;
  text-decoration: none;
}

.favorite-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.96);
  color: #c2410c;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.product-image {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  object-fit: cover;
  background: #edecea;
}

.name-wrapper,
.price-row {
  padding: 0 8px;
}

.name-wrapper strong {
  display: -webkit-box;
  overflow: hidden;
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.price-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sales-inline {
  margin-left: auto;
  color: #8a8885;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.price-row span {
  color: #d08068;
  font-size: 16px;
  font-weight: 600;
}

.price-row small {
  color: #9c9b99;
  font-size: 13px;
  text-decoration: line-through;
}
</style>
