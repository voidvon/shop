import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import {
  readStoredStoreFavoriteState,
  writeStoredStoreFavoriteState,
} from '../infrastructure/browser-store-favorite-storage'

export function useStoreFavorite(
  storeId: MaybeRefOrGetter<string>,
  initialFavorited: MaybeRefOrGetter<boolean>,
) {
  const isStoreFavorited = ref(false)

  const normalizedStoreId = computed(() => toValue(storeId).trim())

  function syncStoreFavorite() {
    if (!normalizedStoreId.value) {
      isStoreFavorited.value = false
      return
    }

    const storedFavoriteState = readStoredStoreFavoriteState(normalizedStoreId.value)

    if (storedFavoriteState === null) {
      isStoreFavorited.value = Boolean(toValue(initialFavorited))
      return
    }

    isStoreFavorited.value = storedFavoriteState
  }

  function toggleStoreFavorite() {
    const nextState = !isStoreFavorited.value
    isStoreFavorited.value = nextState

    if (normalizedStoreId.value) {
      writeStoredStoreFavoriteState(normalizedStoreId.value, nextState)
    }

    return nextState
  }

  watch(
    () => [normalizedStoreId.value, Boolean(toValue(initialFavorited))] as const,
    () => {
      syncStoreFavorite()
    },
    { immediate: true },
  )

  return {
    isStoreFavorited,
    syncStoreFavorite,
    toggleStoreFavorite,
  }
}
