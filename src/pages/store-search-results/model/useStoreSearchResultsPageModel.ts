import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { defaultHotSearchKeywords } from '@/shared/config/search'
import {
  normalizeSearchKeyword,
  saveSearchHistoryKeyword,
} from '@/shared/lib/search-history'
import { useStorefrontQuery, type CategoryPageProductCard } from '@/processes/storefront'

function normalizeRouteKeyword(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? normalizeSearchKeyword(value[0]) : ''
  }

  return typeof value === 'string' ? normalizeSearchKeyword(value) : ''
}

function normalizeRouteString(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0].trim() : ''
  }

  return typeof value === 'string' ? value.trim() : ''
}

export function useStoreSearchResultsPageModel() {
  const route = useRoute()
  const router = useRouter()
  const storefrontQuery = useStorefrontQuery()

  const errorMessage = ref<string | null>(null)
  const hotKeywords = ref([...defaultHotSearchKeywords])
  const isLoading = ref(false)
  const keyword = ref(normalizeRouteKeyword(route.query.keyword))
  const results = ref<CategoryPageProductCard[]>([])
  const storeId = computed(() => normalizeRouteString(route.params.storeId))
  const storeName = ref(normalizeRouteString(route.query.name))
  let latestRequestId = 0

  async function loadSearchResults() {
    const normalizedKeyword = normalizeSearchKeyword(keyword.value)
    const requestId = ++latestRequestId

    if (!normalizedKeyword || !storeId.value) {
      results.value = []
      errorMessage.value = null
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const nextResults = await storefrontQuery.getCategoryProducts({
        keyword: normalizedKeyword,
        merchantId: storeId.value,
      })

      if (requestId !== latestRequestId) {
        return
      }

      results.value = nextResults
    } catch (error) {
      if (requestId !== latestRequestId) {
        return
      }

      errorMessage.value = error instanceof Error ? error.message : '店内搜索结果加载失败'
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

  async function submitSearch(nextKeyword = keyword.value) {
    const normalizedKeyword = normalizeSearchKeyword(nextKeyword)

    if (!normalizedKeyword || !storeId.value) {
      results.value = []
      keyword.value = normalizedKeyword
      return false
    }

    keyword.value = normalizedKeyword
    saveSearchHistoryKeyword(normalizedKeyword)

    if (normalizedKeyword === normalizeRouteKeyword(route.query.keyword)) {
      await loadSearchResults()
      return true
    }

    await router.replace({
      name: 'store-search-results',
      params: {
        storeId: storeId.value,
      },
      query: {
        keyword: normalizedKeyword,
        ...(storeName.value ? { name: storeName.value } : {}),
      },
    })

    return true
  }

  function applyKeyword(nextKeyword: string) {
    keyword.value = normalizeSearchKeyword(nextKeyword)
  }

  watch(
    () => [route.params.storeId, route.query.keyword, route.query.name],
    ([, nextKeyword, nextStoreName]) => {
      keyword.value = normalizeRouteKeyword(nextKeyword)
      storeName.value = normalizeRouteString(nextStoreName)
      void loadSearchResults()
    },
    { immediate: true },
  )

  return {
    applyKeyword,
    errorMessage,
    hotKeywords,
    isLoading,
    keyword,
    results,
    storeId,
    storeName,
    submitSearch,
  }
}
