import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  addCartItem,
  createEmptyCartSnapshot,
  getCartSnapshot,
  type CartSnapshot,
  useCartRepository,
} from '@/entities/cart'
import type { ProductSummary } from '@/entities/product'

export const useCartStore = defineStore('cart', () => {
  const cartRepository = useCartRepository()
  const snapshot = ref<CartSnapshot>(createEmptyCartSnapshot())
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const pendingProductId = ref<string | null>(null)

  const itemCount = computed(() => snapshot.value.itemCount)
  const lines = computed(() => snapshot.value.lines)
  const subtotal = computed(() => snapshot.value.subtotal)

  function isProductPending(productId: string) {
    return pendingProductId.value === productId
  }

  async function loadSnapshot() {
    isLoading.value = true
    errorMessage.value = null

    try {
      snapshot.value = await getCartSnapshot(cartRepository)
      hasLoaded.value = true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '购物车加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(product: ProductSummary) {
    pendingProductId.value = product.id
    errorMessage.value = null

    try {
      snapshot.value = await addCartItem(cartRepository, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
      })
      hasLoaded.value = true
      return snapshot.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '加入购物车失败'
      throw error
    } finally {
      pendingProductId.value = null
    }
  }

  return {
    addProduct,
    errorMessage,
    hasLoaded,
    isLoading,
    isProductPending,
    itemCount,
    lines,
    loadSnapshot,
    pendingProductId,
    snapshot,
    subtotal,
  }
})
