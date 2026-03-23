import { onActivated, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { defaultHotSearchKeywords } from '@/shared/config/search'
import {
  clearSearchHistoryKeywords,
  normalizeSearchKeyword,
  readSearchHistoryKeywords,
  removeSearchHistoryKeyword,
  saveSearchHistoryKeyword,
} from '@/shared/lib/search-history'

function normalizeRouteKeyword(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? normalizeSearchKeyword(value[0]) : ''
  }

  return typeof value === 'string' ? normalizeSearchKeyword(value) : ''
}

export function useSearchPageModel() {
  const route = useRoute()
  const router = useRouter()

  const keyword = ref(normalizeRouteKeyword(route.query.keyword))
  const hotKeywords = ref([...defaultHotSearchKeywords])
  const historyKeywords = ref<string[]>([])

  function syncHistoryKeywords() {
    historyKeywords.value = readSearchHistoryKeywords()
  }

  function applyKeyword(nextKeyword: string) {
    keyword.value = normalizeSearchKeyword(nextKeyword)
  }

  async function submitSearch(nextKeyword = keyword.value) {
    const normalizedKeyword = normalizeSearchKeyword(nextKeyword)

    if (!normalizedKeyword) {
      return false
    }

    keyword.value = normalizedKeyword
    historyKeywords.value = saveSearchHistoryKeyword(normalizedKeyword)

    await router.push({
      name: 'search-results',
      query: {
        keyword: normalizedKeyword,
      },
    })

    return true
  }

  function clearHistory() {
    historyKeywords.value = clearSearchHistoryKeywords()
  }

  function removeHistory(keywordToRemove: string) {
    historyKeywords.value = removeSearchHistoryKeyword(keywordToRemove)
  }

  onMounted(syncHistoryKeywords)
  onActivated(syncHistoryKeywords)

  return {
    applyKeyword,
    clearHistory,
    historyKeywords,
    hotKeywords,
    keyword,
    removeHistory,
    submitSearch,
  }
}
