import { ref } from 'vue'

import { useMemberCenterQuery, type MemberCardBindPageData } from '@/processes/member-center'

const emptyMemberCardBindPageData: MemberCardBindPageData = {
  canScanCode: true,
  cardNumber: null,
}

export function useMemberCardBindPageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const memberCardBindPageData = ref<MemberCardBindPageData>(emptyMemberCardBindPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberCardBindPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberCardBindPageData.value = await memberCenterQuery.getMemberCardBindPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '绑卡页面加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberCardBindPage,
    memberCardBindPageData,
  }
}
