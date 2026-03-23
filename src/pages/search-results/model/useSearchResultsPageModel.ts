import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { defaultHotSearchKeywords } from '@/shared/config/search'
import {
  normalizeSearchKeyword,
  saveSearchHistoryKeyword,
} from '@/shared/lib/search-history'
import { useStorefrontQuery } from '@/processes/storefront'

function normalizeRouteKeyword(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? normalizeSearchKeyword(value[0]) : ''
  }

  return typeof value === 'string' ? normalizeSearchKeyword(value) : ''
}

export function useSearchResultsPageModel() {
  const route = useRoute()
  const router = useRouter()
  const storefrontQuery = useStorefrontQuery()

  const errorMessage = ref<string | null>(null)
  const hotKeywords = ref([...defaultHotSearchKeywords])
  const isLoading = ref(false)
  const keyword = ref(normalizeRouteKeyword(route.query.keyword))
  const results = ref<Awaited<ReturnType<typeof storefrontQuery.getCategoryPageData>>['products']>([])

  async function loadSearchResults() {
    const normalizedKeyword = normalizeSearchKeyword(keyword.value)

    if (!normalizedKeyword) {
      results.value = []
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await storefrontQuery.getCategoryPageData()
      const nextKeyword = normalizedKeyword.toLowerCase()

      results.value = data.products.filter((product) => {
        const searchText = `${product.name} ${product.categoryName}`.toLowerCase()
        return searchText.includes(nextKeyword)
      })
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '搜索结果加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function submitSearch(nextKeyword = keyword.value) {
    const normalizedKeyword = normalizeSearchKeyword(nextKeyword)

    if (!normalizedKeyword) {
      results.value = []
      keyword.value = ''
      return false
    }

    keyword.value = normalizedKeyword
    saveSearchHistoryKeyword(normalizedKeyword)

    if (normalizedKeyword === normalizeRouteKeyword(route.query.keyword)) {
      await loadSearchResults()
      return true
    }

    await router.replace({
      name: 'search-results',
      query: {
        keyword: normalizedKeyword,
      },
    })

    return true
  }

  function applyKeyword(nextKeyword: string) {
    keyword.value = normalizeSearchKeyword(nextKeyword)
  }

  watch(
    () => route.query.keyword,
    (value) => {
      keyword.value = normalizeRouteKeyword(value)
      void loadSearchResults()
    },
    { immediate: true },
  )

  onMounted(() => {
    void loadSearchResults()
  })

  return {
    applyKeyword,
    errorMessage,
    hotKeywords,
    isLoading,
    keyword,
    results,
    submitSearch,
  }
}
