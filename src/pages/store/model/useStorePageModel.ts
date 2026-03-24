import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import {
  type ProductSummary,
  useProductRepository,
} from '@/entities/product'

type StoreTabKey = 'home' | 'all-products' | 'new-products' | 'promotions'

const defaultBenefits = ['满 99 元包邮', '48 小时内发货', '支持售后无忧']

function normalizeStoreName(storeId: string, preferredName: string | null | undefined) {
  const trimmedName = preferredName?.trim()

  if (trimmedName) {
    return trimmedName
  }

  return storeId ? `店铺 ${storeId}` : '店铺主页'
}

function createPromotionProducts(products: ProductSummary[]) {
  const taggedProducts = products.filter((product) => product.tags.some((tag) => tag.includes('推荐')))

  if (taggedProducts.length > 0) {
    return taggedProducts
  }

  return products.slice(0, 6)
}

export function useStorePageModel(
  storeId: MaybeRefOrGetter<string>,
  preferredStoreName: MaybeRefOrGetter<string | null | undefined>,
) {
  const productRepository = useProductRepository()

  const activeTab = ref<StoreTabKey>('home')
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const keyword = ref('')
  const products = ref<ProductSummary[]>([])

  const normalizedStoreId = computed(() => toValue(storeId).trim())
  const storeName = computed(() =>
    normalizeStoreName(normalizedStoreId.value, toValue(preferredStoreName)),
  )
  const filteredProducts = computed(() => {
    const trimmedKeyword = keyword.value.trim().toLowerCase()

    if (!trimmedKeyword) {
      return products.value
    }

    return products.value.filter((product) =>
      [
        product.name,
        product.summary,
        product.category,
        ...product.tags,
      ].some((field) => field.toLowerCase().includes(trimmedKeyword)),
    )
  })
  const recommendedProducts = computed(() => filteredProducts.value.slice(0, 6))
  const promotionProducts = computed(() => createPromotionProducts(filteredProducts.value))
  const newProducts = computed(() => [...filteredProducts.value].reverse())
  const visibleProducts = computed(() => {
    if (activeTab.value === 'home') {
      return recommendedProducts.value
    }

    if (activeTab.value === 'new-products') {
      return newProducts.value
    }

    if (activeTab.value === 'promotions') {
      return promotionProducts.value
    }

    return filteredProducts.value
  })
  const storeStats = computed(() => ({
    monthlySales: products.value.reduce((sum, product) => sum + product.monthlySales, 0),
    onSaleCount: products.value.filter((product) => product.inventory > 0).length,
    productCount: products.value.length,
  }))
  const storeBenefits = computed(() => {
    const dynamicBenefits = [
      storeStats.value.onSaleCount > 0 ? `在售 ${storeStats.value.onSaleCount} 件好物` : null,
      storeStats.value.monthlySales > 0 ? `累计月销 ${storeStats.value.monthlySales}` : null,
      products.value[0]?.category ? `${products.value[0].category} 精选好物` : null,
    ].filter((item): item is string => Boolean(item))

    return dynamicBenefits.length > 0 ? dynamicBenefits : defaultBenefits
  })
  const heroImageUrl = computed(() => products.value[0]?.coverImageUrl ?? null)
  const isEmpty = computed(() => !isLoading.value && !errorMessage.value && visibleProducts.value.length === 0)

  async function loadStorePage() {
    if (!normalizedStoreId.value) {
      products.value = []
      errorMessage.value = '缺少店铺标识'
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      products.value = await productRepository.getMerchantProductSummaries(normalizedStoreId.value)
    } catch (error) {
      products.value = []
      errorMessage.value = error instanceof Error ? error.message : '店铺商品加载失败'
    } finally {
      isLoading.value = false
    }
  }

  function selectTab(tab: StoreTabKey) {
    activeTab.value = tab
  }

  watch(
    () => normalizedStoreId.value,
    () => {
      activeTab.value = 'home'
      keyword.value = ''
      void loadStorePage()
    },
    { immediate: true },
  )

  return {
    activeTab,
    errorMessage,
    heroImageUrl,
    isEmpty,
    isLoading,
    keyword,
    loadStorePage,
    promotionProducts,
    recommendedProducts,
    selectTab,
    storeBenefits,
    storeName,
    storeStats,
    visibleProducts,
  }
}
