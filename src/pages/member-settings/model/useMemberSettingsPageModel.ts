import { ref } from 'vue'

import { useMemberCenterQuery, type MemberSettingsPageData } from '@/processes/member-center'

const emptyMemberSettingsPageData: MemberSettingsPageData = {
  security: {
    canResetPassword: false,
    hasBoundMobile: false,
    hasPaymentPassword: false,
  },
  settings: [],
}

export function useMemberSettingsPageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const memberSettingsPageData = ref<MemberSettingsPageData>(emptyMemberSettingsPageData)

  async function loadMemberSettingsPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberSettingsPageData.value = await memberCenterQuery.getMemberSettingsPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '用户设置加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberSettingsPage,
    memberSettingsPageData,
  }
}
