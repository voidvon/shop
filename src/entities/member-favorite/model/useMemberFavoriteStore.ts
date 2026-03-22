import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useMemberAuthSession } from '@/entities/member-auth'

import { getMemberFavorites } from '../application/get-member-favorites'
import { removeMemberFavorite } from '../application/remove-member-favorite'
import { saveMemberFavorite } from '../application/save-member-favorite'
import type { MemberFavoriteItem } from '../domain/member-favorite'
import { useMemberFavoriteRepository } from '../infrastructure/member-favorite-repository-provider'

interface ToggleMemberFavoriteCommand {
  productId: string
  productImageUrl: string | null
  productName: string
  productPrice: number
  storeName: string
}

export const useMemberFavoriteStore = defineStore('member-favorite', () => {
  const memberAuthSession = useMemberAuthSession()
  const memberFavoriteRepository = useMemberFavoriteRepository()

  const currentUserId = ref(memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? null)
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const items = ref<MemberFavoriteItem[]>([])
  const pendingProductId = ref<string | null>(null)

  const favoriteCount = computed(() => items.value.length)
  const favoriteIds = computed(() => new Set(items.value.map((item) => item.productId)))

  function resetFavorites() {
    items.value = []
    errorMessage.value = null
    hasLoaded.value = false
    isLoading.value = false
    pendingProductId.value = null
  }

  async function syncCurrentUserFavorites(options?: { force?: boolean }) {
    const userId = currentUserId.value

    if (!userId) {
      resetFavorites()
      hasLoaded.value = true
      return items.value
    }

    if (hasLoaded.value && !options?.force) {
      return items.value
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      items.value = await getMemberFavorites(memberFavoriteRepository, userId)
      hasLoaded.value = true
      return items.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '收藏状态同步失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function isProductFavorited(productId: string) {
    return favoriteIds.value.has(productId)
  }

  async function toggleFavorite(command: ToggleMemberFavoriteCommand) {
    const userId = currentUserId.value

    if (!userId) {
      throw new Error('请先登录')
    }

    if (!hasLoaded.value) {
      await syncCurrentUserFavorites()
    }

    pendingProductId.value = command.productId
    errorMessage.value = null

    try {
      const isFavorited = isProductFavorited(command.productId)

      items.value = isFavorited
        ? await removeMemberFavorite(memberFavoriteRepository, userId, command.productId)
        : await saveMemberFavorite(memberFavoriteRepository, userId, {
            productId: command.productId,
            productImageUrl: command.productImageUrl,
            productName: command.productName,
            productPrice: command.productPrice,
            storeName: command.storeName,
          })

      hasLoaded.value = true

      return {
        isFavorited: !isFavorited,
        successMessage: isFavorited ? '已取消收藏' : '已收藏商品',
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '收藏操作失败'
      throw error
    } finally {
      pendingProductId.value = null
    }
  }

  async function ensureFavorite(command: ToggleMemberFavoriteCommand) {
    const userId = currentUserId.value

    if (!userId) {
      throw new Error('请先登录')
    }

    if (!hasLoaded.value) {
      await syncCurrentUserFavorites()
    }

    if (isProductFavorited(command.productId)) {
      return {
        isFavorited: true,
        successMessage: undefined,
      }
    }

    pendingProductId.value = command.productId
    errorMessage.value = null

    try {
      items.value = await saveMemberFavorite(memberFavoriteRepository, userId, {
        productId: command.productId,
        productImageUrl: command.productImageUrl,
        productName: command.productName,
        productPrice: command.productPrice,
        storeName: command.storeName,
      })
      hasLoaded.value = true

      return {
        isFavorited: true,
        successMessage: '已自动收藏商品',
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '收藏操作失败'
      throw error
    } finally {
      pendingProductId.value = null
    }
  }

  async function removeFavoriteByProductId(productId: string) {
    const userId = currentUserId.value

    if (!userId) {
      return items.value
    }

    if (!hasLoaded.value) {
      await syncCurrentUserFavorites()
    }

    pendingProductId.value = productId
    errorMessage.value = null

    try {
      items.value = await removeMemberFavorite(memberFavoriteRepository, userId, productId)
      hasLoaded.value = true
      return items.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '取消收藏失败'
      throw error
    } finally {
      pendingProductId.value = null
    }
  }

  memberAuthSession.subscribe((snapshot) => {
    const nextUserId = snapshot.authResult?.userInfo.userId ?? null

    if (nextUserId === currentUserId.value) {
      return
    }

    currentUserId.value = nextUserId

    if (!nextUserId) {
      resetFavorites()
      hasLoaded.value = true
      return
    }

    void syncCurrentUserFavorites({ force: true })
  })

  if (currentUserId.value) {
    void syncCurrentUserFavorites()
  } else {
    hasLoaded.value = true
  }

  return {
    currentUserId,
    errorMessage,
    favoriteCount,
    hasLoaded,
    isLoading,
    isProductFavorited,
    items,
    pendingProductId,
    ensureFavorite,
    removeFavoriteByProductId,
    syncCurrentUserFavorites,
    toggleFavorite,
  }
})
