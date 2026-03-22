import { computed } from 'vue'

import {
  useMemberFavoriteStore,
} from '@/entities/member-favorite'

export function useMemberFavoritesPageModel() {
  const memberFavoriteStore = useMemberFavoriteStore()

  const memberFavoritesPageData = computed(() => ({
    items: memberFavoriteStore.items,
  }))
  const errorMessage = computed(() => memberFavoriteStore.errorMessage)
  const isLoading = computed(() => memberFavoriteStore.isLoading)

  async function loadMemberFavoritesPage() {
    await memberFavoriteStore.syncCurrentUserFavorites({ force: true })
  }

  async function removeFavorite(productId: string) {
    await memberFavoriteStore.removeFavoriteByProductId(productId)
  }

  return {
    errorMessage,
    isLoading,
    loadMemberFavoritesPage,
    memberFavoritesPageData,
    removeFavorite,
  }
}
