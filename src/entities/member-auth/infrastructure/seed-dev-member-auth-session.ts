import type { AuthResult } from '@/shared/types/modules'

import type { MemberAuthSession } from '../domain/member-auth-session'

function buildDevAuthResult(accessToken: string): AuthResult {
  return {
    capabilities: [
      'wechat-login',
      'wechat-scan-card',
      'recharge-card-payment',
      'payment-code',
    ],
    security: {
      canResetPassword: false,
      hasBoundMobile: false,
      hasPaymentPassword: false,
    },
    session: {
      accessToken,
      expiresAt: null,
      refreshToken: null,
    },
    userInfo: {
      avatarUrl: null,
      email: null,
      merchantId: null,
      mobile: null,
      nickname: null,
      userId: 'dev-token-user',
      username: 'dev-token-user',
    },
  }
}

export function seedDevMemberAuthSession(
  memberAuthSession: MemberAuthSession,
  accessToken = import.meta.env.VITE_DEV_MEMBER_ACCESS_TOKEN,
) {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return
  }

  const normalizedToken = accessToken?.trim()
  if (!normalizedToken) {
    return
  }

  const currentAuthResult = memberAuthSession.getSnapshot().authResult

  if (currentAuthResult?.session.accessToken === normalizedToken) {
    return
  }

  memberAuthSession.setAuthResult(buildDevAuthResult(normalizedToken), {
    persistence: 'local',
  })
}
