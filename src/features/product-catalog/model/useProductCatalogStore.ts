import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getFeaturedProductSummaries,
  type ProductSummary,
  useProductRepository,
} from '@/entities/product'

export const useProductCatalogStore = defineStore('product-catalog', () => {
  const productRepository = useProductRepository()
  const keyword = ref('')
  const products = ref<ProductSummary[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const visibleProducts = computed(() => {
    const normalizedKeyword = keyword.value.trim().toLowerCase()

    if (!normalizedKeyword) {
      return products.value
    }

    return products.value.filter((product) => {
      const searchText = [
        product.name,
        product.category,
        product.summary,
        ...product.tags,
      ]
        .join(' ')
        .toLowerCase()

      return searchText.includes(normalizedKeyword)
    })
  })

  const availableCount = computed(() => visibleProducts.value.length)
  const totalInventory = computed(() =>
    visibleProducts.value.reduce((sum, product) => sum + product.inventory, 0),
  )

  async function loadProducts() {
    isLoading.value = true
    errorMessage.value = null

    try {
      products.value = await getFeaturedProductSummaries(productRepository)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '商品目录加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    availableCount,
    errorMessage,
    isLoading,
    keyword,
    loadProducts,
    totalInventory,
    visibleProducts,
  }
})
