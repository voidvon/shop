import { ref } from 'vue'

import {
  createBrowserMemberHistoryRepository,
  getMemberHistory,
  removeMemberHistory,
  type MemberHistoryItem,
} from '@/entities/member-history'

interface MemberHistoryPageData {
  items: MemberHistoryItem[]
}

const emptyMemberHistoryPageData: MemberHistoryPageData = {
  items: [],
}

export function useMemberHistoryPageModel() {
  const memberHistoryRepository = createBrowserMemberHistoryRepository()

  const memberHistoryPageData = ref<MemberHistoryPageData>(emptyMemberHistoryPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberHistoryPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberHistoryPageData.value = {
        items: await getMemberHistory(memberHistoryRepository),
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '足迹页加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function removeHistoryItem(productId: string) {
    memberHistoryPageData.value = {
      ...memberHistoryPageData.value,
      items: await removeMemberHistory(memberHistoryRepository, productId),
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberHistoryPage,
    memberHistoryPageData,
    removeHistoryItem,
  }
}
