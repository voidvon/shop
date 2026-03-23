import { ref } from 'vue'

import { useMemberCenterQuery, type MemberProfileNamePageData } from '@/processes/member-center'

const emptyMemberProfileNamePageData: MemberProfileNamePageData = {
  currentNickname: '',
  maxLength: 20,
}

export function useMemberProfileNamePageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const memberProfileNamePageData = ref<MemberProfileNamePageData>(emptyMemberProfileNamePageData)

  async function loadMemberProfileNamePage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberProfileNamePageData.value = await memberCenterQuery.getMemberProfileNamePageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '昵称信息加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberProfileNamePage,
    memberProfileNamePageData,
  }
}
