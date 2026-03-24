import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { useStorefrontQuery } from '@/processes/storefront'

function normalizeStoreName(storeId: string, preferredName: string | null | undefined) {
  const trimmedName = preferredName?.trim()

  if (trimmedName) {
    return trimmedName
  }

  return storeId ? `店铺 ${storeId}` : '店铺主页'
}

export function useStoreProfile(
  storeId: MaybeRefOrGetter<string>,
  preferredStoreName: MaybeRefOrGetter<string | null | undefined>,
) {
  const storefrontQuery = useStorefrontQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const productCount = ref(0)
  const monthlySales = ref(0)
  const onSaleCount = ref(0)
  const storeAddress = ref<string | null>(null)
  const storeBenefits = ref<string[]>([])
  const storeBusinessHours = ref<string | null>(null)
  const storeFollowerCount = ref(0)
  const storeLogoUrl = ref<string | null>(null)
  const storePhone = ref<string | null>(null)
  const storeResolvedName = ref<string | null>(null)
  const storeSummary = ref<string | null>(null)
  let latestRequestId = 0

  const normalizedStoreId = computed(() => toValue(storeId).trim())
  const storeName = computed(() =>
    normalizeStoreName(
      normalizedStoreId.value,
      storeResolvedName.value ?? toValue(preferredStoreName),
    ),
  )
  const storeStats = computed(() => ({
    monthlySales: monthlySales.value,
    onSaleCount: onSaleCount.value,
    productCount: productCount.value,
  }))

  async function loadStoreProfile() {
    const requestId = ++latestRequestId

    if (!normalizedStoreId.value) {
      errorMessage.value = '缺少店铺标识'
      isLoading.value = false
      productCount.value = 0
      monthlySales.value = 0
      onSaleCount.value = 0
      storeAddress.value = null
      storeBenefits.value = []
      storeBusinessHours.value = null
      storeFollowerCount.value = 0
      storeLogoUrl.value = null
      storePhone.value = null
      storeResolvedName.value = null
      storeSummary.value = null
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
        errorMessage.value = '未找到店铺信息'
        productCount.value = 0
        monthlySales.value = 0
        onSaleCount.value = 0
        storeAddress.value = null
        storeBenefits.value = []
        storeBusinessHours.value = null
        storeFollowerCount.value = 0
        storeLogoUrl.value = null
        storePhone.value = null
        storeResolvedName.value = null
        storeSummary.value = null
        return
      }

      productCount.value = storePageData.products.length
      monthlySales.value = storePageData.products.reduce((sum, product) => sum + product.monthlySales, 0)
      onSaleCount.value = storePageData.products.filter((product) => product.inventory > 0).length
      storeAddress.value = storePageData.address
      storeBenefits.value = storePageData.benefitTips
      storeBusinessHours.value = storePageData.businessHours
      storeFollowerCount.value = storePageData.followerCount
      storeLogoUrl.value = storePageData.storeLogoUrl
      storePhone.value = storePageData.phone
      storeResolvedName.value = storePageData.storeName
      storeSummary.value = storePageData.summary
    } catch (error) {
      if (requestId !== latestRequestId) {
        return
      }

      errorMessage.value = error instanceof Error ? error.message : '店铺信息加载失败'
      productCount.value = 0
      monthlySales.value = 0
      onSaleCount.value = 0
      storeAddress.value = null
      storeBenefits.value = []
      storeBusinessHours.value = null
      storeFollowerCount.value = 0
      storeLogoUrl.value = null
      storePhone.value = null
      storeResolvedName.value = null
      storeSummary.value = null
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

  watch(
    () => normalizedStoreId.value,
    () => {
      void loadStoreProfile()
    },
    { immediate: true },
  )

  return {
    errorMessage,
    isLoading,
    loadStoreProfile,
    storeAddress,
    storeBenefits,
    storeBusinessHours,
    storeFollowerCount,
    storeLogoUrl,
    storeName,
    storePhone,
    storeStats,
    storeSummary,
  }
}
