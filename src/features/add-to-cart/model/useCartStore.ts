import { computed, onScopeDispose, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  addCartItem,
  createEmptyCartSnapshot,
  getCartSnapshot,
  getSelectedCartSnapshot,
  removeCartItem,
  setCartItemsSelected,
  setCartItemQuantity,
  type CartSnapshot,
  useCartRepository,
} from '@/entities/cart'
import { useMemberAuthSession } from '@/entities/member-auth'
import type { ProductSummary } from '@/entities/product'

export const useCartStore = defineStore('cart', () => {
  const cartRepository = useCartRepository()
  const memberAuthSession = useMemberAuthSession()
  const snapshot = ref<CartSnapshot>(createEmptyCartSnapshot())
  const currentScopeKey = ref(memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest')
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const pendingLineId = ref<string | null>(null)
  const selectedSnapshot = ref<CartSnapshot>(createEmptyCartSnapshot())
  const isSelectionPending = ref(false)

  const itemCount = computed(() => snapshot.value.itemCount)
  const lines = computed(() => snapshot.value.lines)
  const selectedItemCount = computed(() => selectedSnapshot.value.itemCount)
  const selectedLineCount = computed(() => selectedSnapshot.value.lines.length)
  const selectedLineIds = computed(() => selectedSnapshot.value.lines.map((line) => line.lineId))
  const selectedSubtotal = computed(() => selectedSnapshot.value.subtotal)
  const subtotal = computed(() => snapshot.value.subtotal)
  const isAllSelected = computed(
    () => snapshot.value.lines.length > 0 && selectedSnapshot.value.lines.length === snapshot.value.lines.length,
  )

  function isLinePending(lineId: string) {
    return pendingLineId.value === lineId
  }

  function isLineSelected(lineId: string) {
    return selectedLineIds.value.includes(lineId)
  }

  async function syncSelectedSnapshot() {
    selectedSnapshot.value = await getSelectedCartSnapshot(cartRepository)
  }

  async function loadSnapshot() {
    isLoading.value = true
    errorMessage.value = null

    try {
      snapshot.value = await getCartSnapshot(cartRepository)
      await syncSelectedSnapshot()
      hasLoaded.value = true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '购物车加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(
    product: ProductSummary,
    options?: {
      quantity?: number
      skuId?: string | null
      specText?: string | null
      unitPrice?: number
    },
  ) {
    pendingLineId.value = options?.skuId ?? product.id
    errorMessage.value = null

    try {
      snapshot.value = await addCartItem(cartRepository, {
        productId: product.id,
        productImageUrl: product.coverImageUrl,
        productName: product.name,
        quantity: options?.quantity ?? 1,
        skuId: options?.skuId ?? null,
        specText: options?.specText ?? null,
        unitPrice: options?.unitPrice ?? product.price,
      })
      await syncSelectedSnapshot()
      hasLoaded.value = true
      return snapshot.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '加入购物车失败'
      throw error
    } finally {
      pendingLineId.value = null
    }
  }

  async function removeProduct(lineId: string) {
    pendingLineId.value = lineId
    errorMessage.value = null

    try {
      snapshot.value = await removeCartItem(cartRepository, lineId)
      await syncSelectedSnapshot()
      hasLoaded.value = true
      return snapshot.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '删除购物车商品失败'
      throw error
    } finally {
      pendingLineId.value = null
    }
  }

  async function setProductQuantity(lineId: string, quantity: number) {
    pendingLineId.value = lineId
    errorMessage.value = null

    try {
      snapshot.value = await setCartItemQuantity(cartRepository, {
        lineId,
        quantity,
      })
      await syncSelectedSnapshot()
      hasLoaded.value = true
      return snapshot.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新购物车数量失败'
      throw error
    } finally {
      pendingLineId.value = null
    }
  }

  async function setLinesSelected(lineIds: string[], selected: boolean) {
    isSelectionPending.value = true
    errorMessage.value = null

    try {
      selectedSnapshot.value = await setCartItemsSelected(cartRepository, {
        lineIds,
        selected,
      })
      hasLoaded.value = true
      return selectedSnapshot.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '更新待结算商品失败'
      throw error
    } finally {
      isSelectionPending.value = false
    }
  }

  const stopAuthSubscription = memberAuthSession.subscribe((nextSnapshot) => {
    const nextScopeKey = nextSnapshot.authResult?.userInfo.userId ?? 'guest'

    if (nextScopeKey === currentScopeKey.value) {
      return
    }

    currentScopeKey.value = nextScopeKey
    void loadSnapshot()
  })

  onScopeDispose(() => {
    stopAuthSubscription()
  })

  return {
    addProduct,
    currentScopeKey,
    errorMessage,
    hasLoaded,
    isAllSelected,
    isLinePending,
    isLineSelected,
    isLoading,
    isSelectionPending,
    itemCount,
    lines,
    loadSnapshot,
    pendingLineId,
    removeProduct,
    selectedItemCount,
    selectedLineCount,
    selectedLineIds,
    selectedSnapshot,
    selectedSubtotal,
    setProductQuantity,
    setLinesSelected,
    snapshot,
    subtotal,
  }
})
