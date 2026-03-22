import { ref } from 'vue'

import {
  useMemberAuthSession,
} from '@/entities/member-auth'
import {
  getMemberFavorites,
  removeMemberFavorite,
  useMemberFavoriteRepository,
  type MemberFavoriteItem,
} from '@/entities/member-favorite'

interface MemberFavoritesPageData {
  items: MemberFavoriteItem[]
}

const emptyMemberFavoritesPageData: MemberFavoritesPageData = {
  items: [],
}

export function useMemberFavoritesPageModel() {
  const memberAuthSession = useMemberAuthSession()
  const memberFavoriteRepository = useMemberFavoriteRepository()

  const memberFavoritesPageData = ref<MemberFavoritesPageData>(emptyMemberFavoritesPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberFavoritesPage() {
    const userId = memberAuthSession.getSnapshot().authResult?.userInfo.userId

    if (!userId) {
      memberFavoritesPageData.value = emptyMemberFavoritesPageData
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      memberFavoritesPageData.value = {
        items: await getMemberFavorites(memberFavoriteRepository, userId),
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '收藏页加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function removeFavorite(item: MemberFavoriteItem) {
    const userId = memberAuthSession.getSnapshot().authResult?.userInfo.userId

    if (!userId) {
      return
    }

    const items = await removeMemberFavorite(memberFavoriteRepository, userId, item.productId)

    memberFavoritesPageData.value = {
      items,
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberFavoritesPage,
    memberFavoritesPageData,
    removeFavorite,
  }
}
