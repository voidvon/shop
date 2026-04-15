import { ref } from 'vue'

import { useMemberCenterQuery, type MemberPaymentCodePageData } from '@/processes/member-center'
import { isBackendAAuthRecovering } from '@/shared/lib/backend-a-auth-recovery'

const emptyMemberPaymentCodePageData: MemberPaymentCodePageData = {
  paymentCode: null,
}

export function useMemberPaymentCodePageModel() {
  const memberCenterQuery = useMemberCenterQuery()

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const memberPaymentCodePageData = ref<MemberPaymentCodePageData>(emptyMemberPaymentCodePageData)

  async function loadMemberPaymentCodePage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberPaymentCodePageData.value = await memberCenterQuery.getMemberPaymentCodePageData()
    } catch (error) {
      if (!isBackendAAuthRecovering()) {
        errorMessage.value = error instanceof Error ? error.message : '付款码加载失败'
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    loadMemberPaymentCodePage,
    memberPaymentCodePageData,
  }
}
