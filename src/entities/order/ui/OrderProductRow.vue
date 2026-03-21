<script setup lang="ts">
import ProductMediaRow from '@/shared/ui/ProductMediaRow.vue'

defineProps<{
  imageAlt: string
  imageUrl?: string
  priceText: string
  productName: string
  quantityText: string
}>()
</script>

<template>
  <ProductMediaRow
    :image-alt="imageAlt"
    :image-url="imageUrl"
    :price-text="priceText"
    :title="productName"
    :trailing-text="quantityText"
  />
</template>
