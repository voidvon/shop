import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { type ProductSummary } from '@/entities/product'
import { type CategoryPageCategory, useStorefrontQuery } from '@/processes/storefront'

type StoreTabKey = 'home' | 'all-products' | 'new-products' | 'promotions'
type StoreSortField = 'default' | 'price' | 'sales'
type StoreSortDirection = 'asc' | 'desc'
type ProductLoadMode = 'initial' | 'load-more'

interface StoreCategoryOption {
  id: string
  label: string
}

const defaultBenefits = ['满 99 元包邮', '48 小时内发货', '支持售后无忧']
const initialVisibleProductCount = 20
const loadMoreProductCount = 10

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

  return products
}

function normalizePriceInput(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  const parsedValue = Number.parseFloat(normalizedValue)
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null
}

function collectLeafCategories(categories: CategoryPageCategory[]): StoreCategoryOption[] {
  return categories.flatMap((category) => {
    if (category.children.length === 0) {
      return [{ id: category.id, label: category.label }]
    }

    return collectLeafCategories(category.children)
  })
}

function resolveSortQuery(sortField: StoreSortField, sortDirection: StoreSortDirection) {
  if (sortField === 'default') {
    return {}
  }

  if (sortField === 'price') {
    return { sortBy: 'price' as const, sortDir: sortDirection }
  }

  return { sortBy: 'sales_count' as const, sortDir: sortDirection }
}

function sortProducts(items: ProductSummary[], nextSortField: StoreSortField, nextSortDirection: StoreSortDirection) {
  if (nextSortField === 'default') {
    return [...items]
  }

  const directionFactor = nextSortDirection === 'asc' ? 1 : -1
  const sortedItems = [...items]

  if (nextSortField === 'price') {
    sortedItems.sort((left, right) => (left.price - right.price) * directionFactor)
    return sortedItems
  }

  sortedItems.sort((left, right) => (left.monthlySales - right.monthlySales) * directionFactor)
  return sortedItems
}

export function useStorePageModel(
  storeId: MaybeRefOrGetter<string>,
  preferredStoreName: MaybeRefOrGetter<string | null | undefined>,
) {
  const storefrontQuery = useStorefrontQuery()

  const activeTab = ref<StoreTabKey>('home')
  const errorMessage = ref<string | null>(null)
  const isPageLoading = ref(false)
  const isProductsLoading = ref(false)
  const isStoreFavorited = ref(false)
  const keyword = ref('')
  const products = ref<ProductSummary[]>([])
  const feedProducts = ref<ProductSummary[]>([])
  const filteredProducts = ref<ProductSummary[]>([])
  const latestProducts = ref<ProductSummary[]>([])
  const storeAddress = ref<string | null>(null)
  const storeBenefitsSource = ref<string[]>([])
  const storeBusinessHours = ref<string | null>(null)
  const storeCategoryTree = ref<CategoryPageCategory[]>([])
  const storeFollowerCount = ref(0)
  const storeLogoUrl = ref<string | null>(null)
  const minPriceInput = ref('')
  const maxPriceInput = ref('')
  const selectedCategoryId = ref('')
  const sortDirection = ref<StoreSortDirection>('desc')
  const sortField = ref<StoreSortField>('default')
  const storePhone = ref<string | null>(null)
  const storeResolvedName = ref<string | null>(null)
  const storeSummary = ref<string | null>(null)
  const feedPerPage = ref(initialVisibleProductCount)
  const feedTotal = ref(0)
  const filteredPerPage = ref(initialVisibleProductCount)
  const filteredTotal = ref(0)
  const latestPerPage = ref(initialVisibleProductCount)
  const latestTotal = ref(0)
  const isLoadingMoreFeedProducts = ref(false)
  const isLoadingMoreFilteredProducts = ref(false)
  const isLoadingMoreLatestProducts = ref(false)
  let latestRequestId = 0
  let latestFeedRequestId = 0
  let latestFilterRequestId = 0
  let latestNewestRequestId = 0

  const isLoading = computed(() => isPageLoading.value || isProductsLoading.value)
  const normalizedStoreId = computed(() => toValue(storeId).trim())
  const storeName = computed(() =>
    normalizeStoreName(
      normalizedStoreId.value,
      storeResolvedName.value ?? toValue(preferredStoreName),
    ),
  )
  const tabs = ['home', 'all-products', 'new-products', 'promotions'] as const
  const categoryOptions = computed<StoreCategoryOption[]>(() => {
    const leafCategories = collectLeafCategories(storeCategoryTree.value)
    const productCategoryIds = new Set(
      products.value
        .map((product) => product.categoryId.trim())
        .filter(Boolean),
    )

    if (productCategoryIds.size === 0) {
      return leafCategories
    }

    return leafCategories.filter((category) => productCategoryIds.has(category.id))
  })
  const recommendedProducts = computed(() => feedProducts.value)
  const promotionProducts = computed(() => createPromotionProducts(feedProducts.value))
  const visibleProducts = computed(() => {
    if (activeTab.value === 'home') {
      return recommendedProducts.value
    }

    if (activeTab.value === 'new-products') {
      return latestProducts.value
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
  const hasActiveProductFilters = computed(() => (
    selectedCategoryId.value.trim().length > 0
    || minPriceInput.value.trim().length > 0
    || maxPriceInput.value.trim().length > 0
    || sortField.value !== 'default'
  ))
  const isFeedProductsFinished = computed(() => (
    !isLoading.value
    && feedTotal.value >= 0
    && feedProducts.value.length >= feedTotal.value
  ))
  const isFilteredProductsFinished = computed(() => (
    !isLoading.value
    && filteredTotal.value >= 0
    && filteredProducts.value.length >= filteredTotal.value
  ))
  const isLatestProductsFinished = computed(() => (
    !isLoading.value
    && latestTotal.value >= 0
    && latestProducts.value.length >= latestTotal.value
  ))
  const isProductsFinished = computed(() =>
    activeTab.value === 'all-products'
      ? isFilteredProductsFinished.value
      : activeTab.value === 'new-products'
        ? isLatestProductsFinished.value
        : isFeedProductsFinished.value,
  )
  const isLoadingMoreProducts = computed(() =>
    activeTab.value === 'all-products'
      ? isLoadingMoreFilteredProducts.value
      : activeTab.value === 'new-products'
        ? isLoadingMoreLatestProducts.value
        : isLoadingMoreFeedProducts.value,
  )

  function resetFeedPagination() {
    feedPerPage.value = initialVisibleProductCount
    feedTotal.value = 0
    feedProducts.value = []
    isLoadingMoreFeedProducts.value = false
  }

  function resetFilteredPagination() {
    filteredPerPage.value = initialVisibleProductCount
    filteredTotal.value = 0
    filteredProducts.value = []
    isLoadingMoreFilteredProducts.value = false
  }

  function resetLatestPagination() {
    latestPerPage.value = initialVisibleProductCount
    latestTotal.value = 0
    latestProducts.value = []
    isLoadingMoreLatestProducts.value = false
  }

  async function loadFeedProducts(mode: ProductLoadMode = 'initial') {
    const requestId = ++latestFeedRequestId

    if (!normalizedStoreId.value) {
      resetFeedPagination()
      return
    }

    const shouldShowListLoading = mode === 'initial' && feedProducts.value.length === 0

    if (mode === 'load-more') {
      isLoadingMoreFeedProducts.value = true
    } else if (shouldShowListLoading) {
      isProductsLoading.value = true
    }

    try {
      const page = await storefrontQuery.getStoreProductPage({
        merchantId: normalizedStoreId.value,
        perPage: feedPerPage.value,
        sortBy: 'sales_count',
        sortDir: 'desc',
      })

      if (requestId !== latestFeedRequestId) {
        return
      }

      feedProducts.value = sortProducts(page.items, 'sales', 'desc')
      feedTotal.value = page.total
      errorMessage.value = null
    } catch (error) {
      if (requestId !== latestFeedRequestId) {
        return
      }

      if (feedProducts.value.length === 0) {
        errorMessage.value = error instanceof Error ? error.message : '店铺商品加载失败'
      }
    } finally {
      if (requestId === latestFeedRequestId) {
        isLoadingMoreFeedProducts.value = false
        isProductsLoading.value = false
      }
    }
  }

  async function loadLatestProducts(mode: ProductLoadMode = 'initial') {
    const requestId = ++latestNewestRequestId

    if (!normalizedStoreId.value) {
      resetLatestPagination()
      return
    }

    const shouldShowListLoading = mode === 'initial' && latestProducts.value.length === 0

    if (mode === 'load-more') {
      isLoadingMoreLatestProducts.value = true
    } else if (shouldShowListLoading) {
      isProductsLoading.value = true
    }

    try {
      const page = await storefrontQuery.getStoreProductPage({
        merchantId: normalizedStoreId.value,
        perPage: latestPerPage.value,
        sortBy: 'id',
        sortDir: 'desc',
      })

      if (requestId !== latestNewestRequestId) {
        return
      }

      latestProducts.value = page.items
      latestTotal.value = page.total
      errorMessage.value = null
    } catch (error) {
      if (requestId !== latestNewestRequestId) {
        return
      }

      if (latestProducts.value.length === 0) {
        errorMessage.value = error instanceof Error ? error.message : '最新商品加载失败'
      }
    } finally {
      if (requestId === latestNewestRequestId) {
        isLoadingMoreLatestProducts.value = false
        isProductsLoading.value = false
      }
    }
  }

  async function loadFilteredProducts(mode: ProductLoadMode = 'initial') {
    const requestId = ++latestFilterRequestId
    const minPrice = normalizePriceInput(minPriceInput.value)
    const maxPrice = normalizePriceInput(maxPriceInput.value)

    if (!normalizedStoreId.value) {
      resetFilteredPagination()
      return
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      errorMessage.value = '最低价不能高于最高价'
      return
    }

    const shouldShowListLoading = mode === 'initial' && filteredProducts.value.length === 0

    if (mode === 'load-more') {
      isLoadingMoreFilteredProducts.value = true
    } else if (shouldShowListLoading) {
      isProductsLoading.value = true
    }

    errorMessage.value = null

    try {
      const page = await storefrontQuery.getStoreProductPage({
        categoryId: selectedCategoryId.value || undefined,
        maxPrice: maxPrice ?? undefined,
        merchantId: normalizedStoreId.value,
        minPrice: minPrice ?? undefined,
        perPage: filteredPerPage.value,
        ...resolveSortQuery(sortField.value, sortDirection.value),
      })

      if (requestId !== latestFilterRequestId) {
        return
      }

      filteredProducts.value = sortProducts(page.items, sortField.value, sortDirection.value)
      filteredTotal.value = page.total
    } catch (error) {
      if (requestId !== latestFilterRequestId) {
        return
      }

      if (filteredProducts.value.length === 0) {
        errorMessage.value = error instanceof Error ? error.message : '店铺商品筛选失败'
      }
    } finally {
      if (requestId === latestFilterRequestId) {
        isLoadingMoreFilteredProducts.value = false
        isProductsLoading.value = false
      }
    }
  }

  async function loadStorePage() {
    const requestId = ++latestRequestId

    if (!normalizedStoreId.value) {
      products.value = []
      resetFeedPagination()
      resetFilteredPagination()
      resetLatestPagination()
      storeAddress.value = null
      storeBenefitsSource.value = []
      storeBusinessHours.value = null
      storeCategoryTree.value = []
      storeFollowerCount.value = 0
      storeLogoUrl.value = null
      minPriceInput.value = ''
      maxPriceInput.value = ''
      selectedCategoryId.value = ''
      sortDirection.value = 'desc'
      sortField.value = 'default'
      storePhone.value = null
      storeResolvedName.value = null
      storeSummary.value = null
      errorMessage.value = '缺少店铺标识'
      return
    }

    isPageLoading.value = true
    errorMessage.value = null
    resetFeedPagination()
    resetFilteredPagination()
    resetLatestPagination()
    storeCategoryTree.value = []

    try {
      const [storePageResult, categoryTreeResult] = await Promise.allSettled([
        storefrontQuery.getStoreHomePageData(normalizedStoreId.value),
        storefrontQuery.getCategoryTree(),
      ])

      if (requestId !== latestRequestId) {
        return
      }

      storeCategoryTree.value = categoryTreeResult.status === 'fulfilled' ? categoryTreeResult.value : []

      if (categoryTreeResult.status === 'rejected' && import.meta.env.DEV) {
        console.warn('[store-page] category tree load failed', categoryTreeResult.reason)
      }

      if (storePageResult.status === 'rejected') {
        throw storePageResult.reason
      }

      const storePageData = storePageResult.value

      if (!storePageData) {
        products.value = []
        storeAddress.value = null
        storeBenefitsSource.value = []
        storeBusinessHours.value = null
        storeCategoryTree.value = []
        storeFollowerCount.value = 0
        storeLogoUrl.value = null
        selectedCategoryId.value = ''
        storePhone.value = null
        storeResolvedName.value = null
        storeSummary.value = null
        isStoreFavorited.value = false
        errorMessage.value = '未找到店铺信息'
        return
      }

      products.value = storePageData.products
      storeAddress.value = storePageData.address
      storeBenefitsSource.value = storePageData.benefitTips
      storeBusinessHours.value = storePageData.businessHours
      storeFollowerCount.value = storePageData.followerCount
      storeLogoUrl.value = storePageData.storeLogoUrl
      selectedCategoryId.value = ''
      storePhone.value = storePageData.phone
      storeResolvedName.value = storePageData.storeName
      storeSummary.value = storePageData.summary
      isStoreFavorited.value = storePageData.isFavorited
      await loadFeedProducts()

      if (activeTab.value === 'all-products') {
        await loadFilteredProducts()
      }

      if (activeTab.value === 'new-products') {
        await loadLatestProducts()
      }
    } catch (error) {
      if (requestId !== latestRequestId) {
        return
      }

      products.value = []
      resetFeedPagination()
      resetFilteredPagination()
      resetLatestPagination()
      storeAddress.value = null
      storeBenefitsSource.value = []
      storeBusinessHours.value = null
      storeCategoryTree.value = []
      storeFollowerCount.value = 0
      storeLogoUrl.value = null
      selectedCategoryId.value = ''
      storePhone.value = null
      storeResolvedName.value = null
      storeSummary.value = null
      isStoreFavorited.value = false
      errorMessage.value = error instanceof Error ? error.message : '店铺商品加载失败'
    } finally {
      if (requestId === latestRequestId) {
        isPageLoading.value = false
      }
    }
  }

  function selectTab(tab: StoreTabKey) {
    activeTab.value = tab
  }

  function setSortOption(nextSortField: StoreSortField, nextSortDirection: StoreSortDirection) {
    sortField.value = nextSortField
    sortDirection.value = nextSortDirection
    filteredPerPage.value = initialVisibleProductCount
    filteredProducts.value = []
    filteredTotal.value = 0
    activeTab.value = 'all-products'
    void loadFilteredProducts()
  }

  function resetSortOption() {
    sortField.value = 'default'
    sortDirection.value = 'desc'
    filteredPerPage.value = initialVisibleProductCount
    filteredProducts.value = []
    filteredTotal.value = 0
    activeTab.value = 'all-products'
    void loadFilteredProducts()
  }

  function applyPriceFilter() {
    filteredPerPage.value = initialVisibleProductCount
    filteredProducts.value = []
    filteredTotal.value = 0
    activeTab.value = 'all-products'
    void loadFilteredProducts()
  }

  function resetProductFilters() {
    selectedCategoryId.value = ''
    minPriceInput.value = ''
    maxPriceInput.value = ''
    sortDirection.value = 'desc'
    sortField.value = 'default'
    filteredPerPage.value = initialVisibleProductCount
    filteredProducts.value = []
    filteredTotal.value = 0
    errorMessage.value = null
    if (activeTab.value === 'all-products') {
      void loadFilteredProducts()
    }
  }

  async function loadMoreProducts() {
    if (activeTab.value === 'all-products') {
      if (isLoading.value || isLoadingMoreFilteredProducts.value || isFilteredProductsFinished.value) {
        return
      }

      filteredPerPage.value += loadMoreProductCount
      await loadFilteredProducts('load-more')
      return
    }

    if (activeTab.value === 'new-products') {
      if (isLoading.value || isLoadingMoreLatestProducts.value || isLatestProductsFinished.value) {
        return
      }

      latestPerPage.value += loadMoreProductCount
      await loadLatestProducts('load-more')
      return
    }

    if (isLoading.value || isLoadingMoreFeedProducts.value || isFeedProductsFinished.value) {
      return
    }

    feedPerPage.value += loadMoreProductCount
    await loadFeedProducts('load-more')
  }

  function toggleStoreFavorite() {
    isStoreFavorited.value = !isStoreFavorited.value
  }

  function setSelectedCategory(categoryId: string) {
    selectedCategoryId.value = categoryId.trim()
  }

  watch(
    () => normalizedStoreId.value,
    () => {
      activeTab.value = 'home'
      keyword.value = ''
      selectedCategoryId.value = ''
      minPriceInput.value = ''
      maxPriceInput.value = ''
      sortDirection.value = 'desc'
      sortField.value = 'default'
      resetFeedPagination()
      resetFilteredPagination()
      resetLatestPagination()
      void loadStorePage()
    },
    { immediate: true },
  )

  watch(
    () => activeTab.value,
    (tab) => {
      if (tab === 'all-products' && filteredProducts.value.length === 0 && normalizedStoreId.value) {
        void loadFilteredProducts()
      }

      if (tab === 'new-products' && latestProducts.value.length === 0 && normalizedStoreId.value) {
        void loadLatestProducts()
      }

      if (tab !== 'all-products' && tab !== 'new-products' && feedProducts.value.length === 0 && normalizedStoreId.value) {
        void loadFeedProducts()
      }
    },
  )

  return {
    activeTab,
    applyPriceFilter,
    categoryOptions,
    errorMessage,
    hasActiveProductFilters,
    heroImageUrl,
    isEmpty,
    isLoading,
    isLoadingMoreProducts,
    isProductsFinished,
    isStoreFavorited,
    keyword,
    loadMoreProducts,
    loadStorePage,
    maxPriceInput,
    minPriceInput,
    promotionProducts,
    recommendedProducts,
    resetProductFilters,
    resetSortOption,
    selectedCategoryId,
    selectTab,
    setSelectedCategory,
    setSortOption,
    sortDirection,
    sortField,
    storeAddress,
    storeBenefits,
    storeBusinessHours,
    storeFollowerCount,
    storeLogoUrl,
    storeName,
    storePhone,
    storeStats,
    storeSummary,
    tabs,
    toggleStoreFavorite,
    visibleProducts,
  }
}
