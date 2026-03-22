import type { AuthResult, AuthUserInfo } from '@/shared/types/modules'

import type { MemberAuthRepository } from '../../../domain/member-auth-repository'

function createBackendAAuthResult(userInfo: AuthUserInfo): AuthResult {
  const now = Date.now()

  return {
    capabilities: ['wechat-login', 'wechat-scan-card', 'recharge-card-payment', 'payment-code'],
    security: {
      canResetPassword: true,
      hasBoundMobile: userInfo.mobile !== null,
      hasPaymentPassword: false,
    },
    session: {
      accessToken: `backend-a-access-token-${now}`,
      expiresAt: '2026-12-31T23:59:59.000Z',
      refreshToken: `backend-a-refresh-token-${now}`,
    },
    userInfo,
  }
}

function normalizeBackendAUsername(account: string) {
  if (account.includes('@')) {
    return account.slice(0, account.indexOf('@'))
  }

  if (/^1\d{10}$/.test(account)) {
    return `ba_${account.slice(-4)}`
  }

  return account
}

export const backendAMemberAuthRepository: MemberAuthRepository = {
  async login(command) {
    const username = normalizeBackendAUsername(command.account)

    return Promise.resolve(createBackendAAuthResult({
      avatarUrl: null,
      email: command.account.includes('@') ? command.account : null,
      mobile: /^1\d{10}$/.test(command.account) ? command.account : null,
      nickname: `Backend A ${username}`,
      userId: `backend-a-member-${Date.now()}`,
      username,
    }))
  },

  async registerByAccount(command) {
    return Promise.resolve(createBackendAAuthResult({
      avatarUrl: null,
      email: command.email,
      mobile: null,
      nickname: `Backend A ${command.username}`,
      userId: `backend-a-account-${Date.now()}`,
      username: command.username,
    }))
  },

  async registerByMobile(command) {
    const mobileSuffix = command.mobile.slice(-4)

    return Promise.resolve(createBackendAAuthResult({
      avatarUrl: null,
      email: null,
      mobile: command.mobile,
      nickname: `Backend A 手机用户${mobileSuffix}`,
      userId: `backend-a-mobile-${Date.now()}`,
      username: `backend_a_mobile_${mobileSuffix}`,
    }))
  },

  async requestRegisterSmsCode(command) {
    return Promise.resolve({
      countdownSeconds: 90,
      successMessage: `Backend A 验证码已发送至 ${command.mobile}`,
    })
  },
}
