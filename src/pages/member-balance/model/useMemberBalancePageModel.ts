import { ref } from 'vue'

import { useMemberCenterQuery, type MemberCardsPageData } from '@/processes/member-center'

const emptyMemberBalancePageData: MemberCardsPageData = {
  balanceAccounts: [],
  balanceAmount: 0,
  balanceLogs: [],
  redemptionRecords: [],
}

export function useMemberBalancePageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const memberBalancePageData = ref<MemberCardsPageData>(emptyMemberBalancePageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberBalancePage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberBalancePageData.value = await memberCenterQuery.getMemberCardsPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '余额明细加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberBalancePage,
    memberBalancePageData,
  }
}
