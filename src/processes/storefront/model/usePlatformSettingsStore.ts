import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { PlatformSettingsData } from '../domain/storefront-page-data'
import { useStorefrontQuery } from '../infrastructure/storefront-query-provider'

export const usePlatformSettingsStore = defineStore('platform-settings', () => {
  const storefrontQuery = useStorefrontQuery()
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const settings = ref<PlatformSettingsData | null>(null)

  let pendingLoadPromise: Promise<PlatformSettingsData | null> | null = null

  const companyName = computed(() => settings.value?.companyName ?? '')
  const showSalesCount = computed(() => settings.value?.showSalesCount !== false)

  async function loadPlatformSettings(options?: { force?: boolean }) {
    if (hasLoaded.value && !options?.force) {
      return settings.value
    }

    if (pendingLoadPromise) {
      return pendingLoadPromise
    }

    isLoading.value = true
    errorMessage.value = null

    pendingLoadPromise = storefrontQuery
      .getPlatformSettingsData()
      .then((nextSettings) => {
        settings.value = nextSettings
        hasLoaded.value = true
        return nextSettings
      })
      .catch((error: unknown) => {
        errorMessage.value = error instanceof Error ? error.message : '平台设置加载失败'
        hasLoaded.value = true
        return null
      })
      .finally(() => {
        pendingLoadPromise = null
        isLoading.value = false
      })

    return pendingLoadPromise
  }

  return {
    companyName,
    errorMessage,
    hasLoaded,
    isLoading,
    loadPlatformSettings,
    settings,
    showSalesCount,
  }
})
