import { ref } from 'vue'

import { useMemberCenterQuery, type MemberCenterPageData } from '@/processes/member-center'

const emptyMemberCenterPageData: MemberCenterPageData = {
  counts: {
    browsingCount: 0,
    cartCount: 0,
    favoritesCount: 0,
  },
  orderSummary: {
    pendingPaymentCount: 0,
    pendingReceiptCount: 0,
    pendingReviewCount: 0,
    pendingShipmentCount: 0,
    refundAndReturnCount: 0,
  },
  profile: {
    avatarUrl: null,
    isLoggedIn: false,
    username: null,
  },
  servicePhone: '',
  shortcuts: [],
  tipText: '',
}

export function useMemberCenterPageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const memberCenterPageData = ref<MemberCenterPageData>(emptyMemberCenterPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberCenterPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberCenterPageData.value = await memberCenterQuery.getMemberCenterPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '会员中心加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberCenterPage,
    memberCenterPageData,
  }
}
