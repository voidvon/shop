import { ref } from 'vue'

import {
  useMemberAssetsService,
  useMemberCenterQuery,
  type MemberCardsPageData,
  type MemberRechargeOptions,
} from '@/processes/member-center'

const emptyMemberBalancePageData: MemberCardsPageData = {
  balanceAccounts: [],
  balanceAmount: 0,
  balanceLogs: [],
  redemptionRecords: [],
}

export function useMemberBalancePageModel() {
  const memberAssetsService = useMemberAssetsService()
  const memberCenterQuery = useMemberCenterQuery()

  const memberBalancePageData = ref<MemberCardsPageData>(emptyMemberBalancePageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const isRechargeOptionsLoading = ref(false)
  const isRechargeSubmitting = ref(false)
  const rechargeErrorMessage = ref<string | null>(null)
  const rechargeOptions = ref<MemberRechargeOptions | null>(null)

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

  async function loadRechargeOptions() {
    isRechargeOptionsLoading.value = true
    rechargeErrorMessage.value = null

    try {
      rechargeOptions.value = await memberAssetsService.getWechatRechargeOptions()
    } catch (error) {
      rechargeErrorMessage.value = error instanceof Error ? error.message : '充值金额加载失败'
    } finally {
      isRechargeOptionsLoading.value = false
    }
  }

  async function createWechatRecharge(amount: number) {
    isRechargeSubmitting.value = true
    rechargeErrorMessage.value = null

    try {
      await memberAssetsService.createWechatRecharge({ amount })
      await loadMemberBalancePage()
    } catch (error) {
      rechargeErrorMessage.value = error instanceof Error ? error.message : '充值失败'
      throw error
    } finally {
      isRechargeSubmitting.value = false
    }
  }

  return {
    createWechatRecharge,
    errorMessage,
    isLoading,
    isRechargeOptionsLoading,
    isRechargeSubmitting,
    loadMemberBalancePage,
    loadRechargeOptions,
    memberBalancePageData,
    rechargeErrorMessage,
    rechargeOptions,
  }
}
