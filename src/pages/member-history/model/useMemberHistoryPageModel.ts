import { ref } from 'vue'

import {
  useMemberCenterQuery,
  type MemberHistoryPageData,
  type MemberProductListItem,
} from '@/processes/member-center'

const emptyMemberHistoryPageData: MemberHistoryPageData = {
  items: [],
}

export function useMemberHistoryPageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const memberHistoryPageData = ref<MemberHistoryPageData>(emptyMemberHistoryPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberHistoryPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberHistoryPageData.value = await memberCenterQuery.getMemberHistoryPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '足迹页加载失败'
    } finally {
      isLoading.value = false
    }
  }

  function removeHistoryItem(item: MemberProductListItem) {
    memberHistoryPageData.value = {
      ...memberHistoryPageData.value,
      items: memberHistoryPageData.value.items.filter((candidate) => candidate.productId !== item.productId),
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
