<script setup lang="ts">
import { computed } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'

import type { ProductSummary } from '@/entities/product'
import { useModuleAvailability } from '@/shared/lib/modules'

import { useCartStore } from '../model/useCartStore'

const props = defineProps<{
  product: ProductSummary
}>()

const cartStore = useCartStore()
const isCartEnabled = useModuleAvailability('cart')

const isPending = computed(() => cartStore.isProductPending(props.product.id))

async function handleAddToCart() {
  if (!isCartEnabled) {
    return
  }

  try {
    const snapshot = await cartStore.addProduct(props.product)
    showSuccessToast(`已加入购物车，共 ${snapshot.itemCount} 件`)
  } catch {
    showFailToast(cartStore.errorMessage ?? '加入购物车失败')
  }
}
</script>

<template>
  <van-button
    round
    type="primary"
    size="small"
    :disabled="!isCartEnabled"
    :loading="isPending"
    @click="handleAddToCart"
  >
    加入购物车
  </van-button>
</template>
