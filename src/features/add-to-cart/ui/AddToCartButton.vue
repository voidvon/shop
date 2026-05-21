<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { isDirectRechargeProduct, type ProductSummary } from '@/entities/product'
import { useModuleAvailability } from '@/shared/lib/modules'

import { useCartStore } from '../model/useCartStore'

const props = defineProps<{
  product: ProductSummary
}>()

const router = useRouter()
const cartStore = useCartStore()
const isCartEnabled = useModuleAvailability('cart')

const isPending = computed(() => cartStore.isLinePending(props.product.id))
const isDirectRecharge = computed(() => isDirectRechargeProduct(props.product))
const buttonText = computed(() => (isDirectRecharge.value ? '去购买' : '加入购物车'))

async function handleAddToCart() {
  if (isDirectRecharge.value) {
    await router.push({
      name: 'product-detail',
      params: {
        productId: props.product.id,
      },
    })
    return
  }

  if (!isCartEnabled.value) {
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
    :disabled="!isDirectRecharge && !isCartEnabled"
    :loading="isPending"
    @click="handleAddToCart"
  >
    {{ buttonText }}
  </van-button>
</template>
