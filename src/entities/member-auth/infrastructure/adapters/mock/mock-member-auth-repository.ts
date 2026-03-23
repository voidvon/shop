import type { AuthResult, AuthUserInfo } from '@/shared/types/modules'
import { mockAccountData } from '@/shared/mocks'

import type { MemberAuthRepository } from '../../../domain/member-auth-repository'

function createMockAuthResult(userInfo: AuthUserInfo): AuthResult {
  const now = Date.now()

  return {
    ...mockAccountData.authResult,
    session: {
      accessToken: `mock-access-token-${now}`,
      expiresAt: '2026-12-31T23:59:59.000Z',
      refreshToken: `mock-refresh-token-${now}`,
    },
    userInfo,
  }
}

function normalizeUsername(account: string) {
  return account.includes('@') ? account.slice(0, account.indexOf('@')) : account
}

export const mockMemberAuthRepository: MemberAuthRepository = {
  async login(command) {
    const baseUser = mockAccountData.authResult.userInfo
    const normalizedUsername = normalizeUsername(command.account)

    return Promise.resolve(createMockAuthResult({
      ...baseUser,
      email: command.account.includes('@') ? command.account : baseUser.email,
      mobile: /^1\d{10}$/.test(command.account) ? command.account : baseUser.mobile,
      nickname: normalizedUsername || baseUser.nickname,
      username: normalizedUsername || baseUser.username,
    }))
  },

  async loginByWechatCode(command) {
    const baseUser = mockAccountData.authResult.userInfo
    const codeSuffix = command.code.slice(-6) || 'wechat'

    return Promise.resolve(createMockAuthResult({
      ...baseUser,
      mobile: baseUser.mobile,
      nickname: `微信用户${codeSuffix}`,
      username: `wechat_${codeSuffix}`,
    }))
  },

  async registerByAccount(command) {
    return Promise.resolve(createMockAuthResult({
      avatarUrl: null,
      email: command.email,
      mobile: null,
      nickname: command.username,
      userId: `mock-member-${Date.now()}`,
      username: command.username,
    }))
  },

  async registerByMobile(command) {
    const mobileSuffix = command.mobile.slice(-4)

    return Promise.resolve(createMockAuthResult({
      avatarUrl: null,
      email: null,
      mobile: command.mobile,
      nickname: `手机用户${mobileSuffix}`,
      userId: `mock-mobile-member-${Date.now()}`,
      username: `mobile_${mobileSuffix}`,
    }))
  },

  async requestRegisterSmsCode(command) {
    return Promise.resolve({
      countdownSeconds: 60,
      successMessage: `验证码已发送至 ${command.mobile}`,
    })
  },
}
