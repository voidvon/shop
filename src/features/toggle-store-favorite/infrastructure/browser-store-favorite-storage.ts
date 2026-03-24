const storeFavoriteStoragePrefix = 'shop.store-favorites'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createStoreFavoriteStorageKey(storeId: string) {
  return `${storeFavoriteStoragePrefix}.${storeId}`
}

export function readStoredStoreFavoriteState(storeId: string): boolean | null {
  if (!canUseStorage() || !storeId) {
    return null
  }

  const storedValue = window.localStorage.getItem(createStoreFavoriteStorageKey(storeId))

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    return typeof parsedValue === 'boolean' ? parsedValue : null
  } catch {
    window.localStorage.removeItem(createStoreFavoriteStorageKey(storeId))
    return null
  }
}

export function writeStoredStoreFavoriteState(storeId: string, isFavorited: boolean) {
  if (!canUseStorage() || !storeId) {
    return
  }

  window.localStorage.setItem(
    createStoreFavoriteStorageKey(storeId),
    JSON.stringify(isFavorited),
  )
}
