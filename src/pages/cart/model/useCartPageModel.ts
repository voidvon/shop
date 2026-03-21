import { ref } from 'vue'

import { usePageContentGateway, type CartPageData } from '@/shared/page-content'

const emptyCartPageData: CartPageData = {
  groups: [],
  totalAmount: 0,
}

export function useCartPageModel() {
  const gateway = usePageContentGateway()

  const cartPageData = ref<CartPageData>(emptyCartPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadCartPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      cartPageData.value = await gateway.getCartPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '购物车页面加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    cartPageData,
    errorMessage,
    isLoading,
    loadCartPage,
  }
}
