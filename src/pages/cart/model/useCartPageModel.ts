import { computed, ref } from 'vue'

import { useCartStore } from '@/features/add-to-cart'
import { useTradeQuery, type CartPageData } from '@/processes/trade'
import type { CartPageGroup } from '@/processes/trade/domain/trade-page-data'

const emptyCartPageData: CartPageData = {
  groups: [],
  totalAmount: 0,
}

export function useCartPageModel() {
  const cartStore = useCartStore()
  const tradeQuery = useTradeQuery()

  const cartPageData = ref<CartPageData>(emptyCartPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function refreshCartPage() {
    cartPageData.value = await tradeQuery.getCartPageData()
  }

  async function loadCartPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      await cartStore.loadSnapshot()
      await refreshCartPage()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '购物车页面加载失败'
    } finally {
      isLoading.value = false
    }
  }

  function isItemPending(productId: string) {
    return cartStore.isProductPending(productId)
  }

  function isProductSelected(productId: string) {
    return cartStore.isProductSelected(productId)
  }

  function isGroupSelected(group: CartPageGroup) {
    return group.items.length > 0 && group.items.every((item) => cartStore.isProductSelected(item.productId))
  }

  async function setAllSelected(selected: boolean) {
    const productIds = cartPageData.value.groups.flatMap((group) =>
      group.items.map((item) => item.productId),
    )

    if (productIds.length === 0) {
      return
    }

    errorMessage.value = null

    try {
      await cartStore.setProductsSelected(productIds, selected)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新待结算商品失败'
      throw error
    }
  }

  async function setGroupSelected(group: CartPageGroup, selected: boolean) {
    const productIds = group.items.map((item) => item.productId)

    if (productIds.length === 0) {
      return
    }

    errorMessage.value = null

    try {
      await cartStore.setProductsSelected(productIds, selected)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新待结算商品失败'
      throw error
    }
  }

  async function setProductSelected(productId: string, selected: boolean) {
    errorMessage.value = null

    try {
      await cartStore.setProductsSelected([productId], selected)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新待结算商品失败'
      throw error
    }
  }

  async function removeItem(productId: string) {
    errorMessage.value = null

    try {
      await cartStore.removeProduct(productId)
      await refreshCartPage()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '删除购物车商品失败'
      throw error
    }
  }

  async function setItemQuantity(productId: string, quantity: number) {
    errorMessage.value = null

    try {
      await cartStore.setProductQuantity(productId, quantity)
      await refreshCartPage()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新购物车数量失败'
      throw error
    }
  }

  return {
    cartPageData,
    errorMessage,
    isAllSelected: computed(() => cartStore.isAllSelected),
    isLoading,
    isItemPending,
    isProductSelected,
    isSelectionPending: computed(() => cartStore.isSelectionPending),
    isGroupSelected,
    loadCartPage,
    removeItem,
    selectedItemCount: computed(() => cartStore.selectedItemCount),
    selectedTotalAmount: computed(() => cartStore.selectedSubtotal),
    setAllSelected,
    setGroupSelected,
    setItemQuantity,
    setProductSelected,
  }
}
