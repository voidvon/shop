import { computed, onUnmounted, ref } from 'vue'

import { useMemberAuthSession } from '@/entities/member-auth'
import { canBindMemberMobileByWechat } from '@/processes/member-center/application/member-settings-policy'

export function useMemberMobilePageModel() {
  const memberAuthSession = useMemberAuthSession()
  const authSnapshot = ref(memberAuthSession.getSnapshot())

  const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
    authSnapshot.value = snapshot
  })

  onUnmounted(() => {
    stopAuthSubscription()
  })

  const currentMobile = computed(() => authSnapshot.value.authResult?.userInfo.mobile ?? '未绑定手机号')
  const canBindMobileByWechat = computed(() => canBindMemberMobileByWechat(authSnapshot.value.authResult))

  const maskedMobile = computed(() => {
    const mobile = currentMobile.value

    return /^\d{11}$/.test(mobile)
      ? `${mobile.slice(0, 3)}****${mobile.slice(-4)}`
      : mobile
  })

  const mobileStatusText = computed(() =>
    /^\d{11}$/.test(currentMobile.value)
      ? '当前账号已完成手机号绑定。'
      : '当前账号还未绑定手机号。',
  )

  return {
    canBindMobileByWechat,
    currentMobile,
    maskedMobile,
    mobileStatusText,
  }
}
