import { ref } from 'vue'

import { useMemberCenterQuery, type MemberCardsPageData } from '@/processes/member-center'

const emptyMemberCardsPageData: MemberCardsPageData = {
  balanceAccounts: [],
  balanceAmount: 0,
  balanceLogs: [],
  redemptionRecords: [],
}

export function useMemberCardsPageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const memberCardsPageData = ref<MemberCardsPageData>(emptyMemberCardsPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberCardsPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberCardsPageData.value = await memberCenterQuery.getMemberCardsPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '卡券页面加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberCardsPage,
    memberCardsPageData,
  }
}
