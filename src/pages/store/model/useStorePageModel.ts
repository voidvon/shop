import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { useStoreProductBrowser } from '@/features/store-product-browser'
import { useStoreProfile } from '@/features/store-profile'
import { useStoreFavorite } from '@/features/toggle-store-favorite'

export function useStorePageModel(
  storeId: MaybeRefOrGetter<string>,
  preferredStoreName: MaybeRefOrGetter<string | null | undefined>,
) {
  const keyword = ref('')
  const storeProfile = useStoreProfile(storeId, preferredStoreName)
  const storeProductBrowser = useStoreProductBrowser(
    storeId,
    computed(() => storeProfile.storeProducts.value),
  )
  const storeFavorite = useStoreFavorite(
    storeId,
    computed(() => storeProfile.isStoreFavorited.value),
  )

  const errorMessage = computed(() => storeProfile.errorMessage.value ?? storeProductBrowser.errorMessage.value)
  const isLoading = computed(() => storeProfile.isLoading.value || storeProductBrowser.isLoading.value)
  const tabs = computed(() => storeProfile.tabs.value.length > 0
    ? storeProfile.tabs.value
    : storeProductBrowser.tabs.value)
  const heroImageUrl = computed(() => storeProductBrowser.heroImageUrl.value ?? storeProfile.storeLogoUrl.value)

  async function loadStorePage() {
    await Promise.all([
      storeProfile.loadStoreProfile(),
      storeProductBrowser.loadStoreBrowser(),
    ])
    storeFavorite.syncStoreFavorite()
  }

  watch(
    () => toValue(storeId),
    () => {
      keyword.value = ''
    },
  )

  return {
    activeTab: storeProductBrowser.activeTab,
    applyPriceFilter: storeProductBrowser.applyPriceFilter,
    categoryOptions: storeProductBrowser.categoryOptions,
    errorMessage,
    hasActiveProductFilters: storeProductBrowser.hasActiveProductFilters,
    heroImageUrl,
    isEmpty: storeProductBrowser.isEmpty,
    isLoading,
    isLoadingMoreProducts: storeProductBrowser.isLoadingMoreProducts,
    isProductsFinished: storeProductBrowser.isProductsFinished,
    isStoreFavorited: storeFavorite.isStoreFavorited,
    keyword,
    loadMoreProducts: storeProductBrowser.loadMoreProducts,
    loadStorePage,
    maxPriceInput: storeProductBrowser.maxPriceInput,
    minPriceInput: storeProductBrowser.minPriceInput,
    resetProductFilters: storeProductBrowser.resetProductFilters,
    resetSortOption: storeProductBrowser.resetSortOption,
    selectedCategoryId: storeProductBrowser.selectedCategoryId,
    selectTab: storeProductBrowser.selectTab,
    setSelectedCategory: storeProductBrowser.setSelectedCategory,
    setSortOption: storeProductBrowser.setSortOption,
    sortDirection: storeProductBrowser.sortDirection,
    sortField: storeProductBrowser.sortField,
    storeAddress: storeProfile.storeAddress,
    storeBenefits: storeProfile.storeBenefits,
    storeBusinessHours: storeProfile.storeBusinessHours,
    storeFollowerCount: storeProfile.storeFollowerCount,
    storeLogoUrl: storeProfile.storeLogoUrl,
    storeName: storeProfile.storeName,
    storePhone: storeProfile.storePhone,
    storeStats: storeProfile.storeStats,
    storeSummary: storeProfile.storeSummary,
    tabs,
    toggleStoreFavorite: storeFavorite.toggleStoreFavorite,
    visibleProducts: storeProductBrowser.visibleProducts,
  }
}
