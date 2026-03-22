import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import {
  createBrowserMemberHistoryRepository,
  saveMemberHistory,
} from '@/entities/member-history'
import {
  type ProductDetail,
} from '@/entities/product'
import { useStorefrontQuery, type ProductDetailPageData } from '@/processes/storefront'

const memberHistoryRepository = createBrowserMemberHistoryRepository()

export function useProductDetailPageModel(productId: MaybeRefOrGetter<string>) {
  const storefrontQuery = useStorefrontQuery()

  const detailPage = ref<ProductDetailPageData | null>(null)
  const product = ref<ProductDetail | null>(null)
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)

  const isNotFound = computed(
    () => hasLoaded.value && !isLoading.value && !errorMessage.value && !product.value,
  )

  async function syncMemberHistory(pageData: ProductDetailPageData) {
    try {
      await saveMemberHistory(memberHistoryRepository, {
        productId: pageData.product.id,
        productImageUrl: pageData.product.coverImageUrl,
        productName: pageData.product.name,
        productPrice: pageData.product.price,
        storeName: pageData.store?.storeName ?? '默认店铺',
      })
    } catch {
      // Browsing history persistence should not block the product detail page.
    }
  }

  async function loadProductDetail() {
    const currentProductId = toValue(productId).trim()

    if (!currentProductId) {
      product.value = null
      errorMessage.value = '缺少商品标识'
      hasLoaded.value = true
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      detailPage.value = await storefrontQuery.getProductDetailPageData(currentProductId)
      product.value = detailPage.value?.product ?? null
      if (detailPage.value) {
        await syncMemberHistory(detailPage.value)
      }
      hasLoaded.value = true
    } catch (error) {
      detailPage.value = null
      product.value = null
      errorMessage.value = error instanceof Error ? error.message : '商品详情加载失败'
      hasLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => toValue(productId),
    () => {
      void loadProductDetail()
    },
    { immediate: true },
  )

  return {
    detailPage,
    errorMessage,
    hasLoaded,
    isLoading,
    isNotFound,
    loadProductDetail,
    product,
  }
}
