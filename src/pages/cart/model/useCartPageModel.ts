import { ref } from 'vue'

import { useTradeQuery, type CartPageData } from '@/processes/trade'

const emptyCartPageData: CartPageData = {
  groups: [],
  totalAmount: 0,
}

export function useCartPageModel() {
  const tradeQuery = useTradeQuery()

  const cartPageData = ref<CartPageData>(emptyCartPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadCartPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      cartPageData.value = await tradeQuery.getCartPageData()
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
