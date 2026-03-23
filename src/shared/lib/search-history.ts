const searchHistoryStorageKey = 'shop.search-history'
const maxSearchHistoryKeywords = 10

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function normalizeSearchKeyword(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function isSearchKeyword(value: unknown): value is string {
  return typeof value === 'string' && normalizeSearchKeyword(value).length > 0
}

export function readSearchHistoryKeywords() {
  if (!canUseStorage()) {
    return []
  }

  const storedValue = window.localStorage.getItem(searchHistoryStorageKey)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!Array.isArray(parsedValue)) {
      window.localStorage.removeItem(searchHistoryStorageKey)
      return []
    }

    return parsedValue
      .filter(isSearchKeyword)
      .map((keyword) => normalizeSearchKeyword(keyword))
      .filter((keyword, index, items) => items.indexOf(keyword) === index)
      .slice(0, maxSearchHistoryKeywords)
  } catch {
    window.localStorage.removeItem(searchHistoryStorageKey)
    return []
  }
}

function writeSearchHistoryKeywords(keywords: string[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(searchHistoryStorageKey, JSON.stringify(keywords))
}

export function saveSearchHistoryKeyword(keyword: string) {
  const normalizedKeyword = normalizeSearchKeyword(keyword)

  if (!normalizedKeyword) {
    return readSearchHistoryKeywords()
  }

  const nextKeywords = [
    normalizedKeyword,
    ...readSearchHistoryKeywords().filter((item) => item !== normalizedKeyword),
  ].slice(0, maxSearchHistoryKeywords)

  writeSearchHistoryKeywords(nextKeywords)
  return nextKeywords
}

export function removeSearchHistoryKeyword(keyword: string) {
  const normalizedKeyword = normalizeSearchKeyword(keyword)
  const nextKeywords = readSearchHistoryKeywords().filter((item) => item !== normalizedKeyword)
  writeSearchHistoryKeywords(nextKeywords)
  return nextKeywords
}

export function clearSearchHistoryKeywords() {
  if (!canUseStorage()) {
    return []
  }

  window.localStorage.removeItem(searchHistoryStorageKey)
  return []
}
