import { computed, ref } from 'vue'

import { useStorefrontQuery, type HomePageData } from '@/processes/storefront'

const emptyHomePageData: HomePageData = {
  banners: [],
  featuredProducts: [],
  partnerStoreTypes: [],
  promo_video: null,
  quickCategories: [],
}
const initialHotProductCount = 20
const hotProductPageSize = 10

export function useHomePageModel() {
  const storefrontQuery = useStorefrontQuery()

  const homePageData = ref<HomePageData>(emptyHomePageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const isLoadingMoreHotProducts = ref(false)
  const visibleHotProductCount = ref(0)

  const displayedHotProducts = computed(() =>
    homePageData.value.featuredProducts.slice(0, visibleHotProductCount.value),
  )
  const isHotProductsFinished = computed(
    () => visibleHotProductCount.value >= homePageData.value.featuredProducts.length,
  )

  function resetHotProductsPagination() {
    visibleHotProductCount.value = Math.min(initialHotProductCount, homePageData.value.featuredProducts.length)
    isLoadingMoreHotProducts.value = false
  }

  async function loadHomePage(options: { refresh?: boolean } = {}) {
    const refresh = options.refresh === true

    if (refresh) {
      if (isLoading.value) {
        return
      }

      isRefreshing.value = true
    } else {
      if (isLoading.value || isRefreshing.value) {
        return
      }

      isLoading.value = true
    }

    errorMessage.value = null

    try {
      homePageData.value = await storefrontQuery.getHomePageData()
      resetHotProductsPagination()
    } catch (error) {
      if (!refresh) {
        homePageData.value = emptyHomePageData
        resetHotProductsPagination()
      }

      errorMessage.value = error instanceof Error ? error.message : '首页数据加载失败'
    } finally {
      if (refresh) {
        isRefreshing.value = false
      } else {
        isLoading.value = false
      }
    }
  }

  async function loadMoreHotProducts() {
    if (isLoading.value || isRefreshing.value || isLoadingMoreHotProducts.value || isHotProductsFinished.value) {
      isLoadingMoreHotProducts.value = false
      return
    }

    isLoadingMoreHotProducts.value = true

    visibleHotProductCount.value = Math.min(
      visibleHotProductCount.value + hotProductPageSize,
      homePageData.value.featuredProducts.length,
    )
    isLoadingMoreHotProducts.value = false
  }

  return {
    displayedHotProducts,
    errorMessage,
    homePageData,
    isHotProductsFinished,
    isLoading,
    isRefreshing,
    isLoadingMoreHotProducts,
    loadMoreHotProducts,
    loadHomePage,
  }
}
