import { ref } from 'vue'

import {
  useMemberCenterQuery,
  type MemberCouponsPageData,
} from '@/processes/member-center'

const emptyMemberCouponsPageData: MemberCouponsPageData = {
  items: [],
}

export function useMemberCouponsPageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const memberCouponsPageData = ref<MemberCouponsPageData>(emptyMemberCouponsPageData)

  async function loadMemberCouponsPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberCouponsPageData.value = await memberCenterQuery.getMemberCouponsPageData()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '优惠券列表加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberCouponsPage,
    memberCouponsPageData,
  }
}
