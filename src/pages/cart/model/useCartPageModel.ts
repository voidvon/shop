import { computed, ref } from 'vue'

import { type CartSnapshot } from '@/entities/cart'
import { useCartStore } from '@/features/add-to-cart'
import { type CartPageData } from '@/processes/trade'
import type { CartPageGroup } from '@/processes/trade/domain/trade-page-data'

const emptyCartPageData: CartPageData = {
  groups: [],
  totalAmount: 0,
}

function resolveCartLineStore(line: CartSnapshot['lines'][number]) {
  const normalizedStoreId = line.storeId?.trim() ?? ''
  const normalizedStoreName = line.storeName?.trim() ?? ''

  return {
    storeId: normalizedStoreId || `cart-store-${line.lineId}`,
    storeName: normalizedStoreName || '商家',
  }
}

function mapCartSnapshotToPageData(snapshot: CartSnapshot): CartPageData {
  if (snapshot.lines.length === 0) {
    return emptyCartPageData
  }

  const groupsByStoreId = new Map<string, CartPageData['groups'][number]>()

  snapshot.lines.forEach((line) => {
    const store = resolveCartLineStore(line)
    const existingGroup = groupsByStoreId.get(store.storeId)
    const item = {
      balanceTypeName: line.balanceTypeName?.trim() ?? null,
      lineId: line.lineId,
      productId: line.productId,
      productImageUrl: line.productImageUrl ?? null,
      productName: line.productName,
      quantity: line.quantity,
      specText: line.specText?.trim() ?? null,
      unitPrice: line.unitPrice,
    }

    if (existingGroup) {
      existingGroup.items.push(item)
      return
    }

    groupsByStoreId.set(store.storeId, {
      items: [item],
      storeId: store.storeId,
      storeName: store.storeName,
    })
  })

  return {
    groups: Array.from(groupsByStoreId.values()),
    totalAmount: snapshot.subtotal,
  }
}

export function useCartPageModel() {
  const cartStore = useCartStore()

  const cartPageData = ref<CartPageData>(emptyCartPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function refreshCartPage() {
    cartPageData.value = mapCartSnapshotToPageData(cartStore.snapshot)
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

  function isItemPending(lineId: string) {
    return cartStore.isLinePending(lineId)
  }

  function isLineSelected(lineId: string) {
    return cartStore.isLineSelected(lineId)
  }

  function isGroupSelected(group: CartPageGroup) {
    return group.items.length > 0 && group.items.every((item) => cartStore.isLineSelected(item.lineId))
  }

  async function setAllSelected(selected: boolean) {
    const lineIds = cartPageData.value.groups.flatMap((group) =>
      group.items.map((item) => item.lineId),
    )

    if (lineIds.length === 0) {
      return
    }

    errorMessage.value = null

    try {
      await cartStore.setLinesSelected(lineIds, selected)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新待结算商品失败'
      throw error
    }
  }

  async function setGroupSelected(group: CartPageGroup, selected: boolean) {
    const lineIds = group.items.map((item) => item.lineId)

    if (lineIds.length === 0) {
      return
    }

    errorMessage.value = null

    try {
      await cartStore.setLinesSelected(lineIds, selected)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新待结算商品失败'
      throw error
    }
  }

  async function setLineSelected(lineId: string, selected: boolean) {
    errorMessage.value = null

    try {
      await cartStore.setLinesSelected([lineId], selected)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新待结算商品失败'
      throw error
    }
  }

  async function removeItem(lineId: string) {
    errorMessage.value = null

    try {
      await cartStore.removeProduct(lineId)
      await refreshCartPage()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '删除购物车商品失败'
      throw error
    }
  }

  async function setItemQuantity(lineId: string, quantity: number) {
    errorMessage.value = null

    try {
      await cartStore.setProductQuantity(lineId, quantity)
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
    isLineSelected,
    isSelectionPending: computed(() => cartStore.isSelectionPending),
    isGroupSelected,
    loadCartPage,
    removeItem,
    selectedItemCount: computed(() => cartStore.selectedItemCount),
    selectedTotalAmount: computed(() => cartStore.selectedSubtotal),
    setAllSelected,
    setGroupSelected,
    setItemQuantity,
    setLineSelected,
  }
}
