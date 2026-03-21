import { ref } from 'vue'

import { usePageContentGateway, type MemberCardBindPageData } from '@/shared/page-content'

const emptyMemberCardBindPageData: MemberCardBindPageData = {
  cardNumber: null,
}

export function useMemberCardBindPageModel() {
  const gateway = usePageContentGateway()

  const memberCardBindPageData = ref<MemberCardBindPageData>(emptyMemberCardBindPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberCardBindPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberCardBindPageData.value = await gateway.getMemberCardBindPageData()
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
