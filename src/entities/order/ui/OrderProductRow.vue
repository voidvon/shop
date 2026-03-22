<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import ProductMediaRow from '@/shared/ui/ProductMediaRow.vue'

defineProps<{
  imageAlt: string
  imageUrl?: string
  priceText: string
  productName: string
  quantityText: string
  to?: RouteLocationRaw
}>()
</script>

<template>
  <RouterLink v-if="to" :to="to" class="order-product-link">
    <ProductMediaRow
      :image-alt="imageAlt"
      :image-url="imageUrl"
      :price-text="priceText"
      :title="productName"
      :trailing-text="quantityText"
    />
  </RouterLink>

  <ProductMediaRow
    v-else
    :image-alt="imageAlt"
    :image-url="imageUrl"
    :price-text="priceText"
    :title="productName"
    :trailing-text="quantityText"
  />
</template>

<style scoped>
.order-product-link {
  display: block;
  color: inherit;
  text-decoration: none;
}
</style>
