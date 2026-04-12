import { computed, onUnmounted, ref } from 'vue'

import { useMemberAuthSession } from '@/entities/member-auth'

export function useMemberMobilePageModel() {
  const memberAuthSession = useMemberAuthSession()
  const authSnapshot = ref(memberAuthSession.getSnapshot())

  const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
    authSnapshot.value = snapshot
  })

  onUnmounted(() => {
    stopAuthSubscription()
  })

  const currentMobile = computed(() => authSnapshot.value.authResult?.userInfo.mobile ?? null)

  const maskedMobile = computed(() => {
    const mobile = currentMobile.value

    return mobile && /^\d{11}$/.test(mobile)
      ? `${mobile.slice(0, 3)}****${mobile.slice(-4)}`
      : (mobile ?? '未绑定手机号')
  })

  return {
    currentMobile,
    maskedMobile,
  }
}
