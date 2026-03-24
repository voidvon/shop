import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { type ProductSummary } from '@/entities/product'
import { useStorefrontQuery } from '@/processes/storefront'

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
  const storefrontQuery = useStorefrontQuery()

  const activeTab = ref<StoreTabKey>('home')
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const isStoreFavorited = ref(false)
  const keyword = ref('')
  const products = ref<ProductSummary[]>([])
  const storeAddress = ref<string | null>(null)
  const storeBenefitsSource = ref<string[]>([])
  const storeBusinessHours = ref<string | null>(null)
  const storeLogoUrl = ref<string | null>(null)
  const storePhone = ref<string | null>(null)
  const storeResolvedName = ref<string | null>(null)
  let latestRequestId = 0

  const normalizedStoreId = computed(() => toValue(storeId).trim())
  const storeName = computed(() =>
    normalizeStoreName(
      normalizedStoreId.value,
      storeResolvedName.value ?? toValue(preferredStoreName),
    ),
  )
  const tabs = ['home', 'all-products', 'new-products', 'promotions'] as const
  const recommendedProducts = computed(() => products.value.slice(0, 6))
  const promotionProducts = computed(() => createPromotionProducts(products.value))
  const newProducts = computed(() => [...products.value].reverse())
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

    return products.value
  })
  const storeStats = computed(() => ({
    monthlySales: products.value.reduce((sum, product) => sum + product.monthlySales, 0),
    onSaleCount: products.value.filter((product) => product.inventory > 0).length,
    productCount: products.value.length,
  }))
  const storeBenefits = computed(() => {
    if (storeBenefitsSource.value.length > 0) {
      return storeBenefitsSource.value
    }

    const dynamicBenefits = [
      storeStats.value.onSaleCount > 0 ? `在售 ${storeStats.value.onSaleCount} 件好物` : null,
      storeStats.value.monthlySales > 0 ? `累计月销 ${storeStats.value.monthlySales}` : null,
      storeBusinessHours.value ? `营业时间 ${storeBusinessHours.value}` : null,
      products.value[0]?.category ? `${products.value[0].category} 精选好物` : null,
    ].filter((item): item is string => Boolean(item))

    return dynamicBenefits.length > 0 ? dynamicBenefits : defaultBenefits
  })
  const heroImageUrl = computed(() => products.value[0]?.coverImageUrl ?? storeLogoUrl.value ?? null)
  const isEmpty = computed(() => !isLoading.value && !errorMessage.value && visibleProducts.value.length === 0)

  async function loadStorePage() {
    const requestId = ++latestRequestId

    if (!normalizedStoreId.value) {
      products.value = []
      storeAddress.value = null
      storeBenefitsSource.value = []
      storeBusinessHours.value = null
      storeLogoUrl.value = null
      storePhone.value = null
      storeResolvedName.value = null
      errorMessage.value = '缺少店铺标识'
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const storePageData = await storefrontQuery.getStoreHomePageData(normalizedStoreId.value)

      if (requestId !== latestRequestId) {
        return
      }

      if (!storePageData) {
        products.value = []
        storeAddress.value = null
        storeBenefitsSource.value = []
        storeBusinessHours.value = null
        storeLogoUrl.value = null
        storePhone.value = null
        storeResolvedName.value = null
        isStoreFavorited.value = false
        errorMessage.value = '未找到店铺信息'
        return
      }

      products.value = storePageData.products
      storeAddress.value = storePageData.address
      storeBenefitsSource.value = storePageData.benefitTips
      storeBusinessHours.value = storePageData.businessHours
      storeLogoUrl.value = storePageData.storeLogoUrl
      storePhone.value = storePageData.phone
      storeResolvedName.value = storePageData.storeName
      isStoreFavorited.value = storePageData.isFavorited
    } catch (error) {
      if (requestId !== latestRequestId) {
        return
      }

      products.value = []
      storeAddress.value = null
      storeBenefitsSource.value = []
      storeBusinessHours.value = null
      storeLogoUrl.value = null
      storePhone.value = null
      storeResolvedName.value = null
      isStoreFavorited.value = false
      errorMessage.value = error instanceof Error ? error.message : '店铺商品加载失败'
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

  function selectTab(tab: StoreTabKey) {
    activeTab.value = tab
  }

  function toggleStoreFavorite() {
    isStoreFavorited.value = !isStoreFavorited.value
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
    isStoreFavorited,
    keyword,
    loadStorePage,
    promotionProducts,
    recommendedProducts,
    selectTab,
    storeAddress,
    storeBenefits,
    storeLogoUrl,
    storeName,
    storePhone,
    storeStats,
    tabs,
    toggleStoreFavorite,
    visibleProducts,
  }
}
