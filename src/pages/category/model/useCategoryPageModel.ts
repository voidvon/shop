import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  usePageContentGateway,
  type CategoryPageCategory,
  type CategoryPageData,
} from '@/shared/page-content'

function findPrimaryCategory(categories: CategoryPageCategory[], categoryId: string) {
  return categories.find((category) => category.id === categoryId) ?? categories[0] ?? null
}

function resolveInitialSecondaryCategoryId(primaryCategory: CategoryPageCategory | null) {
  return primaryCategory?.children[0]?.id ?? ''
}

function normalizeRouteValue(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function findPrimaryCategoryBySecondaryId(categories: CategoryPageCategory[], secondaryCategoryId: string) {
  return categories.find((category) => category.children.some((child) => child.id === secondaryCategoryId)) ?? null
}

function resolveRouteCategoryIds(route: ReturnType<typeof useRoute>) {
  return {
    primaryCategoryId:
      normalizeRouteValue(route.params.primaryCategoryId)
      || normalizeRouteValue(route.query.primaryCategoryId),
    secondaryCategoryId:
      normalizeRouteValue(route.params.secondaryCategoryId)
      || normalizeRouteValue(route.query.secondaryCategoryId),
  }
}

export function useCategoryPageModel() {
  const gateway = usePageContentGateway()
  const route = useRoute()
  const router = useRouter()

  const categoryPageData = ref<CategoryPageData | null>(null)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const keyword = ref('')
  const selectedPrimaryCategoryId = ref('')
  const selectedSecondaryCategoryId = ref('')

  const primaryCategories = computed(() => categoryPageData.value?.primaryCategories ?? [])

  const activePrimaryCategory = computed(() =>
    findPrimaryCategory(primaryCategories.value, selectedPrimaryCategoryId.value),
  )

  const secondaryCategories = computed(() => activePrimaryCategory.value?.children ?? [])

  const activeSecondaryCategory = computed(
    () =>
      secondaryCategories.value.find((category) => category.id === selectedSecondaryCategoryId.value)
      ?? secondaryCategories.value[0]
      ?? null,
  )

  const visibleProducts = computed(() => {
    const normalizedKeyword = keyword.value.trim().toLowerCase()
    let products = categoryPageData.value?.products ?? []

    if (activeSecondaryCategory.value) {
      products = products.filter((product) => product.categoryId === activeSecondaryCategory.value?.id)
    } else if (activePrimaryCategory.value) {
      const secondaryCategoryIds = new Set(activePrimaryCategory.value.children.map((category) => category.id))
      products = products.filter((product) => secondaryCategoryIds.has(product.categoryId))
    }

    if (!normalizedKeyword) {
      return products
    }

    return products.filter((product) => {
      const searchText = `${product.name} ${product.categoryName}`.toLowerCase()
      return searchText.includes(normalizedKeyword)
    })
  })

  function applyRouteSelection(data: CategoryPageData) {
    const { primaryCategoryId, secondaryCategoryId } = resolveRouteCategoryIds(route)
    const primaryCategory = primaryCategoryId
      ? findPrimaryCategory(data.primaryCategories, primaryCategoryId)
      : findPrimaryCategoryBySecondaryId(data.primaryCategories, secondaryCategoryId) ?? data.primaryCategories[0] ?? null
    const secondaryCategory =
      primaryCategory?.children.find((category) => category.id === secondaryCategoryId)
      ?? primaryCategory?.children[0]
      ?? null

    selectedPrimaryCategoryId.value = primaryCategory?.id ?? ''
    selectedSecondaryCategoryId.value = secondaryCategory?.id ?? resolveInitialSecondaryCategoryId(primaryCategory)
  }

  async function syncRouteCategoryIds(primaryCategoryId: string, secondaryCategoryId: string) {
    const currentRouteCategoryIds = resolveRouteCategoryIds(route)

    if (
      currentRouteCategoryIds.primaryCategoryId === primaryCategoryId
      && currentRouteCategoryIds.secondaryCategoryId === secondaryCategoryId
    ) {
      return
    }

    const nextQuery = { ...route.query }
    delete nextQuery.primaryCategoryId
    delete nextQuery.secondaryCategoryId

    await router.replace({
      name: 'category',
      params: {
        primaryCategoryId: primaryCategoryId || undefined,
        secondaryCategoryId: secondaryCategoryId || undefined,
      },
      query: nextQuery,
    })
  }

  function selectPrimaryCategory(categoryId: string) {
    const primaryCategory = findPrimaryCategory(primaryCategories.value, categoryId)
    const nextPrimaryCategoryId = primaryCategory?.id ?? ''
    const nextSecondaryCategoryId = resolveInitialSecondaryCategoryId(primaryCategory)

    selectedPrimaryCategoryId.value = nextPrimaryCategoryId
    selectedSecondaryCategoryId.value = nextSecondaryCategoryId
    void syncRouteCategoryIds(nextPrimaryCategoryId, nextSecondaryCategoryId)
  }

  function selectSecondaryCategory(categoryId: string) {
    selectedSecondaryCategoryId.value = categoryId
    void syncRouteCategoryIds(selectedPrimaryCategoryId.value, categoryId)
  }

  async function loadCategoryPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await gateway.getCategoryPageData()
      categoryPageData.value = data
      applyRouteSelection(data)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '分类页数据加载失败'
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => [
      normalizeRouteValue(route.params.primaryCategoryId),
      normalizeRouteValue(route.params.secondaryCategoryId),
      normalizeRouteValue(route.query.primaryCategoryId),
      normalizeRouteValue(route.query.secondaryCategoryId),
    ],
    () => {
      if (!categoryPageData.value) {
        return
      }

      applyRouteSelection(categoryPageData.value)
    },
  )

  return {
    activePrimaryCategory,
    activeSecondaryCategory,
    errorMessage,
    isLoading,
    keyword,
    loadCategoryPage,
    primaryCategories,
    secondaryCategories,
    selectPrimaryCategory,
    selectSecondaryCategory,
    selectedPrimaryCategoryId,
    selectedSecondaryCategoryId,
    visibleProducts,
  }
}
