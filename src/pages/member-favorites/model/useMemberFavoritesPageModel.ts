import { ref } from 'vue'

import {
  usePageContentGateway,
  type MemberFavoritesPageData,
  type MemberProductListItem,
} from '@/shared/page-content'

const emptyMemberFavoritesPageData: MemberFavoritesPageData = {
  items: [],
}

export function useMemberFavoritesPageModel() {
  const gateway = usePageContentGateway()

  const memberFavoritesPageData = ref<MemberFavoritesPageData>(emptyMemberFavoritesPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberFavoritesPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberFavoritesPageData.value = await gateway.getMemberFavoritesPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '收藏页加载失败'
    } finally {
      isLoading.value = false
    }
  }

  function removeFavorite(item: MemberProductListItem) {
    memberFavoritesPageData.value = {
      ...memberFavoritesPageData.value,
      items: memberFavoritesPageData.value.items.filter((candidate) => candidate.productId !== item.productId),
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
