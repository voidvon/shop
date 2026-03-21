import { ref } from 'vue'

import { usePageContentGateway, type MemberCardsPageData } from '@/shared/page-content'

const emptyMemberCardsPageData: MemberCardsPageData = {
  balanceAmount: 0,
  cardNumber: null,
}

export function useMemberCardsPageModel() {
  const gateway = usePageContentGateway()

  const memberCardsPageData = ref<MemberCardsPageData>(emptyMemberCardsPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberCardsPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberCardsPageData.value = await gateway.getMemberCardsPageData()
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
