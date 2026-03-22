import { ref } from 'vue'

import { useMemberAuthSession } from '@/entities/member-auth'
import {
  countMemberHistory,
  createBrowserMemberHistoryRepository,
} from '@/entities/member-history'
import {
  countMemberFavorites,
  useMemberFavoriteRepository,
} from '@/entities/member-favorite'
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
  const memberAuthSession = useMemberAuthSession()
  const memberHistoryRepository = createBrowserMemberHistoryRepository()
  const memberFavoriteRepository = useMemberFavoriteRepository()
  const memberCenterQuery = useMemberCenterQuery()

  const memberCenterPageData = ref<MemberCenterPageData>(emptyMemberCenterPageData)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function loadMemberCenterPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      const pageData = await memberCenterQuery.getMemberCenterPageData()
      const browsingCount = await countMemberHistory(memberHistoryRepository)
      const authSnapshot = memberAuthSession.getSnapshot()
      const authResult = authSnapshot.authResult

      memberCenterPageData.value = authResult
        ? {
          ...pageData,
          counts: {
            ...pageData.counts,
            browsingCount,
            favoritesCount: await countMemberFavorites(memberFavoriteRepository, authResult.userInfo.userId),
          },
          profile: {
            avatarUrl: authResult.userInfo.avatarUrl,
            isLoggedIn: true,
            username: authResult.userInfo.nickname ?? authResult.userInfo.username,
          },
        }
        : {
          ...pageData,
          counts: {
            browsingCount,
            cartCount: 0,
            favoritesCount: 0,
          },
          profile: {
            avatarUrl: null,
            isLoggedIn: false,
            username: null,
          },
        }
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
