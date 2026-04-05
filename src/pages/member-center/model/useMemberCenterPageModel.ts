import { computed, onUnmounted, ref } from 'vue'

import { useMemberAuthSession } from '@/entities/member-auth'
import {
  countMemberHistory,
  createBrowserMemberHistoryRepository,
} from '@/entities/member-history'
import { useMemberFavoriteStore } from '@/entities/member-favorite'
import { useCartStore } from '@/features/add-to-cart'
import {
  useMemberCenterQuery,
  type MemberCenterPageData,
  type MemberShortcut,
} from '@/processes/member-center'

const defaultMemberShortcuts: MemberShortcut[] = [
  { key: 'cards', label: '我的卡券', route: '/member/assets/cards' },
  { key: 'payment-code', label: '付款码', route: '/member/assets/payment-code' },
  { key: 'balance', label: '账户余额', route: '/member/assets/balance' },
  { key: 'settings', label: '用户设置', route: '/member/settings' },
]

const emptyMemberCenterPageData: MemberCenterPageData = {
  counts: {
    browsingCount: 0,
    cartCount: 0,
    couponCount: 0,
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
  servicePhone: null,
  shortcuts: defaultMemberShortcuts.map((shortcut) => ({ ...shortcut })),
  tipText: '',
}

export function useMemberCenterPageModel() {
  const memberAuthSession = useMemberAuthSession()
  const memberHistoryRepository = createBrowserMemberHistoryRepository()
  const memberFavoriteStore = useMemberFavoriteStore()
  const cartStore = useCartStore()
  const memberCenterQuery = useMemberCenterQuery()

  const authSnapshot = ref(memberAuthSession.getSnapshot())
  const basePageData = ref<MemberCenterPageData>(emptyMemberCenterPageData)
  const browsingCount = ref(0)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
    authSnapshot.value = snapshot
  })

  onUnmounted(() => {
    stopAuthSubscription()
  })

  const memberCenterPageData = computed<MemberCenterPageData>(() => {
    const authResult = authSnapshot.value.authResult

    if (!authResult) {
      return {
        ...basePageData.value,
        counts: {
          browsingCount: browsingCount.value,
          cartCount: 0,
          couponCount: 0,
          favoritesCount: 0,
        },
        profile: {
          avatarUrl: null,
          isLoggedIn: false,
          username: null,
        },
        shortcuts: defaultMemberShortcuts.map((shortcut) => ({ ...shortcut })),
      }
    }

    return {
      ...basePageData.value,
      counts: {
        ...basePageData.value.counts,
        browsingCount: browsingCount.value,
        cartCount: cartStore.itemCount,
        favoritesCount: memberFavoriteStore.favoriteCount,
      },
      profile: {
        avatarUrl: authResult.userInfo.avatarUrl,
        isLoggedIn: true,
        username: authResult.userInfo.nickname ?? authResult.userInfo.username,
      },
      shortcuts: defaultMemberShortcuts.map((shortcut) => ({ ...shortcut })),
    }
  })

  async function loadMemberCenterPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      const [pageData, nextBrowsingCount] = await Promise.all([
        memberCenterQuery.getMemberCenterPageData(),
        countMemberHistory(memberHistoryRepository),
      ])

      basePageData.value = pageData
      browsingCount.value = nextBrowsingCount

      if (authSnapshot.value.authResult) {
        await Promise.all([
          cartStore.loadSnapshot(),
          memberFavoriteStore.syncCurrentUserFavorites({ force: true }),
        ])
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
