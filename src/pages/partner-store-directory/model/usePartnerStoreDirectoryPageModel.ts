import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

import { useStorefrontQuery } from '@/processes/storefront'

export function usePartnerStoreDirectoryPageModel(
  storeTypeId: MaybeRefOrGetter<string>,
  preferredStoreTypeLabel: MaybeRefOrGetter<string>,
) {
  const storefrontQuery = useStorefrontQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const isLoadingMerchants = ref(false)
  const merchants = ref<Awaited<ReturnType<typeof storefrontQuery.getPartnerMerchants>>>([])
  const partnerStoreTypes = ref<Awaited<ReturnType<typeof storefrontQuery.getPartnerStoreTypes>>>([])
  const regions = ref<Awaited<ReturnType<typeof storefrontQuery.getPartnerRegions>>>([])
  const resolvedStoreTypeId = ref('')
  const selectedRegionId = ref('')

  const hasRegions = computed(() => regions.value.length > 0)
  const resolvedStoreTypeLabel = computed(
    () => partnerStoreTypes.value.find((item) => item.id === resolvedStoreTypeId.value)?.label
      ?? toValue(preferredStoreTypeLabel).trim()
      ?? '',
  )
  const selectedRegionLabel = computed(
    () => regions.value.find((region) => region.id === selectedRegionId.value)?.label ?? '',
  )

  function normalizeText(value: string) {
    return value.trim().toLowerCase()
  }

  function stripLegacySuffix(value: string) {
    return value.replace(/-\d+$/, '')
  }

  function resolveStoreTypeId(rawStoreTypeId: string) {
    const normalizedRawStoreTypeId = rawStoreTypeId.trim()

    if (!normalizedRawStoreTypeId) {
      return ''
    }

    const directMatch = partnerStoreTypes.value.find((item) => item.id === normalizedRawStoreTypeId)

    if (directMatch) {
      return directMatch.id
    }

    const candidateLabels = [
      toValue(preferredStoreTypeLabel).trim(),
      stripLegacySuffix(normalizedRawStoreTypeId),
      normalizedRawStoreTypeId,
    ]
      .map((value) => value.trim())
      .filter(Boolean)

    const matchedType = partnerStoreTypes.value.find((item) =>
      candidateLabels.some((candidate) => normalizeText(item.label) === normalizeText(candidate)),
    )

    return matchedType?.id ?? normalizedRawStoreTypeId
  }

  async function loadMerchants(regionId = selectedRegionId.value) {
    const normalizedStoreTypeId = resolvedStoreTypeId.value.trim()

    if (!normalizedStoreTypeId) {
      merchants.value = []
      return
    }

    isLoadingMerchants.value = true

    try {
      merchants.value = await storefrontQuery.getPartnerMerchants({
        regionId: regionId || undefined,
        storeTypeId: normalizedStoreTypeId,
      })
      errorMessage.value = null
    } catch (error) {
      merchants.value = []
      errorMessage.value = error instanceof Error ? error.message : '合作商家加载失败'
    } finally {
      isLoadingMerchants.value = false
    }
  }

  async function loadPage() {
    const normalizedStoreTypeId = toValue(storeTypeId).trim()

    if (!normalizedStoreTypeId) {
      partnerStoreTypes.value = []
      regions.value = []
      merchants.value = []
      resolvedStoreTypeId.value = ''
      selectedRegionId.value = ''
      errorMessage.value = '缺少合作门店类型'
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const [nextPartnerStoreTypes, nextRegions] = await Promise.all([
        storefrontQuery.getPartnerStoreTypes(),
        storefrontQuery.getPartnerRegions(),
      ])

      partnerStoreTypes.value = nextPartnerStoreTypes
      resolvedStoreTypeId.value = resolveStoreTypeId(normalizedStoreTypeId)
      regions.value = nextRegions

      const nextSelectedRegionId =
        nextRegions.find((region) => region.id === selectedRegionId.value)?.id
        ?? nextRegions[0]?.id
        ?? ''

      selectedRegionId.value = nextSelectedRegionId
      await loadMerchants(nextSelectedRegionId)
    } catch (error) {
      partnerStoreTypes.value = []
      regions.value = []
      merchants.value = []
      resolvedStoreTypeId.value = ''
      selectedRegionId.value = ''
      errorMessage.value = error instanceof Error ? error.message : '合作门店页面加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function selectRegion(regionId: string) {
    if (!regionId || regionId === selectedRegionId.value || isLoadingMerchants.value) {
      return
    }

    selectedRegionId.value = regionId
    await loadMerchants(regionId)
  }

  return {
    errorMessage,
    hasRegions,
    isLoading,
    isLoadingMerchants,
    loadPage,
    merchants,
    partnerStoreTypes,
    regions,
    resolvedStoreTypeId,
    resolvedStoreTypeLabel,
    selectRegion,
    selectedRegionId,
    selectedRegionLabel,
  }
}
