import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  useStorefrontQuery,
  type CategoryPageCategory,
  type CategoryPageProductCard,
} from '@/processes/storefront'

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
    keyword: normalizeRouteValue(route.query.keyword),
    primaryCategoryId:
      normalizeRouteValue(route.params.primaryCategoryId)
      || normalizeRouteValue(route.query.primaryCategoryId),
    secondaryCategoryId:
      normalizeRouteValue(route.params.secondaryCategoryId)
      || normalizeRouteValue(route.query.secondaryCategoryId),
  }
}

export function useCategoryPageModel() {
  const storefrontQuery = useStorefrontQuery()
  const route = useRoute()
  const router = useRouter()

  const primaryCategories = ref<CategoryPageCategory[]>([])
  const products = ref<CategoryPageProductCard[]>([])
  const errorMessage = ref<string | null>(null)
  const isLoadingCategories = ref(false)
  const isLoadingProducts = ref(false)
  const keyword = ref('')
  const selectedPrimaryCategoryId = ref('')
  const selectedSecondaryCategoryId = ref('')
  let latestProductsRequestId = 0

  const isLoading = computed(() => isLoadingCategories.value || isLoadingProducts.value)

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

    if (!normalizedKeyword) {
      return products.value
    }

    return products.value.filter((product) => {
      const searchText = `${product.name} ${product.categoryName}`.toLowerCase()
      return searchText.includes(normalizedKeyword)
    })
  })

  function resolveSelectedCategoryId() {
    return activeSecondaryCategory.value?.id || activePrimaryCategory.value?.id || ''
  }

  function applyRouteSelection(categories: CategoryPageCategory[]) {
    const { keyword: routeKeyword, primaryCategoryId, secondaryCategoryId } = resolveRouteCategoryIds(route)
    const primaryCategory = primaryCategoryId
      ? findPrimaryCategory(categories, primaryCategoryId)
      : findPrimaryCategoryBySecondaryId(categories, secondaryCategoryId) ?? categories[0] ?? null
    const secondaryCategory =
      primaryCategory?.children.find((category) => category.id === secondaryCategoryId)
      ?? primaryCategory?.children[0]
      ?? null

    selectedPrimaryCategoryId.value = primaryCategory?.id ?? ''
    selectedSecondaryCategoryId.value = secondaryCategory?.id ?? resolveInitialSecondaryCategoryId(primaryCategory)
    keyword.value = routeKeyword
  }

  async function loadProductsForSelectedCategory() {
    const categoryId = resolveSelectedCategoryId()
    const requestId = ++latestProductsRequestId

    if (!categoryId) {
      products.value = []
      isLoadingProducts.value = false
      return
    }

    isLoadingProducts.value = true
    errorMessage.value = null
    products.value = []

    try {
      const nextProducts = await storefrontQuery.getCategoryProducts({ categoryId })

      if (requestId !== latestProductsRequestId) {
        return
      }

      products.value = nextProducts
    } catch (error) {
      if (requestId !== latestProductsRequestId) {
        return
      }

      errorMessage.value = error instanceof Error ? error.message : '分类商品加载失败'
    } finally {
      if (requestId === latestProductsRequestId) {
        isLoadingProducts.value = false
      }
    }
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

    if (keyword.value) {
      nextQuery.keyword = keyword.value
    } else {
      delete nextQuery.keyword
    }

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
    void loadProductsForSelectedCategory()
  }

  function selectSecondaryCategory(categoryId: string) {
    selectedSecondaryCategoryId.value = categoryId
    void syncRouteCategoryIds(selectedPrimaryCategoryId.value, categoryId)
    void loadProductsForSelectedCategory()
  }

  async function loadCategoryPage() {
    isLoadingCategories.value = true
    errorMessage.value = null
    products.value = []

    try {
      const categories = await storefrontQuery.getCategoryTree()
      primaryCategories.value = categories
      applyRouteSelection(categories)
      await loadProductsForSelectedCategory()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '分类页数据加载失败'
    } finally {
      isLoadingCategories.value = false
    }
  }

  watch(
    () => [
      normalizeRouteValue(route.query.keyword),
      normalizeRouteValue(route.params.primaryCategoryId),
      normalizeRouteValue(route.params.secondaryCategoryId),
      normalizeRouteValue(route.query.primaryCategoryId),
      normalizeRouteValue(route.query.secondaryCategoryId),
    ],
    () => {
      if (primaryCategories.value.length === 0) {
        return
      }

      const previousSelectedCategoryId = resolveSelectedCategoryId()
      applyRouteSelection(primaryCategories.value)

      if (resolveSelectedCategoryId() !== previousSelectedCategoryId) {
        void loadProductsForSelectedCategory()
      }
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
