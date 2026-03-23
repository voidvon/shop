import { ref } from 'vue'

import { useMemberCenterQuery, type MemberAboutPageData } from '@/processes/member-center'

const emptyMemberAboutPageData: MemberAboutPageData = {
  companyName: '',
  copyrightYear: new Date().getFullYear(),
  operatorName: '',
  organizerName: '',
  platformBackground: '',
  platformMission: '',
}

export function useMemberAboutPageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const memberAboutPageData = ref<MemberAboutPageData>(emptyMemberAboutPageData)

  async function loadMemberAboutPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberAboutPageData.value = await memberCenterQuery.getMemberAboutPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '关于我们加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberAboutPage,
    memberAboutPageData,
  }
}
