import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { useStoreProductBrowser } from '@/features/store-product-browser'
import { useStoreProfile } from '@/features/store-profile'
import { useStoreFavorite } from '@/features/toggle-store-favorite'
import { type MerchantCoupon, useStorefrontQuery } from '@/processes/storefront'

export function useStorePageModel(
  storeId: MaybeRefOrGetter<string>,
  preferredStoreName: MaybeRefOrGetter<string | null | undefined>,
) {
  const storefrontQuery = useStorefrontQuery()
  const keyword = ref('')
  const claimingCouponId = ref<string | null>(null)
  const couponErrorMessage = ref<string | null>(null)
  const isCouponLoading = ref(false)
  const merchantCoupons = ref<MerchantCoupon[]>([])
  const storeProfile = useStoreProfile(storeId, preferredStoreName)
  const storeProductBrowser = useStoreProductBrowser(
    storeId,
    computed(() => storeProfile.storeProducts.value),
  )
  const storeFavorite = useStoreFavorite(
    storeId,
    computed(() => storeProfile.isStoreFavorited.value),
  )
  let latestCouponRequestId = 0

  async function loadMerchantCoupons() {
    const normalizedStoreId = toValue(storeId).trim()
    const requestId = ++latestCouponRequestId

    if (!normalizedStoreId) {
      couponErrorMessage.value = null
      isCouponLoading.value = false
      merchantCoupons.value = []
      return
    }

    isCouponLoading.value = true
    couponErrorMessage.value = null

    try {
      const coupons = await storefrontQuery.getMerchantCoupons(normalizedStoreId)

      if (requestId !== latestCouponRequestId) {
        return
      }

      merchantCoupons.value = coupons
    } catch (error) {
      if (requestId !== latestCouponRequestId) {
        return
      }

      couponErrorMessage.value = error instanceof Error ? error.message : '优惠券加载失败'
      merchantCoupons.value = []
    } finally {
      if (requestId === latestCouponRequestId) {
        isCouponLoading.value = false
      }
    }
  }

  async function claimMerchantCoupon(couponTemplateId: string) {
    if (claimingCouponId.value) {
      return
    }

    claimingCouponId.value = couponTemplateId

    try {
      await storefrontQuery.claimMerchantCoupon(couponTemplateId)
      await loadMerchantCoupons()
    } finally {
      claimingCouponId.value = null
    }
  }

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
      couponErrorMessage.value = null
      isCouponLoading.value = false
      merchantCoupons.value = []
    },
  )

  return {
    activeTab: storeProductBrowser.activeTab,
    applyPriceFilter: storeProductBrowser.applyPriceFilter,
    categoryOptions: storeProductBrowser.categoryOptions,
    claimMerchantCoupon,
    claimingCouponId,
    couponErrorMessage,
    errorMessage,
    hasActiveProductFilters: storeProductBrowser.hasActiveProductFilters,
    heroImageUrl,
    isCouponLoading,
    isEmpty: storeProductBrowser.isEmpty,
    isLoading,
    isLoadingMoreProducts: storeProductBrowser.isLoadingMoreProducts,
    isProductsFinished: storeProductBrowser.isProductsFinished,
    isStoreFavorited: storeFavorite.isStoreFavorited,
    keyword,
    loadMerchantCoupons,
    loadMoreProducts: storeProductBrowser.loadMoreProducts,
    loadStorePage,
    maxPriceInput: storeProductBrowser.maxPriceInput,
    merchantCoupons,
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
