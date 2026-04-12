import type { AuthResult } from '@/shared/types/modules'

import type { MemberAuthSessionPersistence } from '../../../domain/member-auth'
import type { MemberAuthSession } from '../../../domain/member-auth-session'
import type {
  BindMemberMobileByWechatResult,
  MemberProfileService,
  UpdateMemberMobileCommand,
  UpdateMemberMobileResult,
  UpdateMemberNicknameCommand,
} from '../../../domain/member-profile-service'

function resolvePersistence(): MemberAuthSessionPersistence {
  if (typeof window === 'undefined') {
    return 'local'
  }

  return window.localStorage.getItem('shop.member-auth.session')
    ? 'local'
    : 'session'
}

function createMockWechatMobile() {
  const seed = `${Date.now()}`.slice(-8)
  return `139${seed}`
}

function buildNextAuthResult(authResult: AuthResult, mobile: string): AuthResult {
  return {
    ...authResult,
    security: {
      ...authResult.security,
      hasBoundMobile: true,
    },
    userInfo: {
      ...authResult.userInfo,
      mobile,
    },
  }
}

function buildNextAuthResultWithNickname(authResult: AuthResult, nickname: string): AuthResult {
  return {
    ...authResult,
    userInfo: {
      ...authResult.userInfo,
      nickname,
    },
  }
}

export function createMockMemberProfileService(memberAuthSession: MemberAuthSession): MemberProfileService {
  return {
    async bindMobileByWechat(): Promise<BindMemberMobileByWechatResult> {
      const authResult = memberAuthSession.getSnapshot().authResult

      if (!authResult) {
        throw new Error('当前未登录，无法绑定手机号')
      }

      const mobile = authResult.userInfo.mobile ?? createMockWechatMobile()

      memberAuthSession.setAuthResult(
        buildNextAuthResult(authResult, mobile),
        { persistence: resolvePersistence() },
      )

      return { mobile }
    },

    async updateMobile(command: UpdateMemberMobileCommand): Promise<UpdateMemberMobileResult> {
      const authResult = memberAuthSession.getSnapshot().authResult

      if (!authResult) {
        throw new Error('当前未登录，无法保存手机号')
      }

      const mobile = command.mobile.replace(/\D/g, '').slice(0, 11)

      if (!mobile) {
        throw new Error('请输入手机号')
      }

      if (!/^1\d{10}$/.test(mobile)) {
        throw new Error('请输入正确手机号')
      }

      memberAuthSession.setAuthResult(
        buildNextAuthResult(authResult, mobile),
        { persistence: resolvePersistence() },
      )

      return { mobile }
    },

    async updateNickname(command: UpdateMemberNicknameCommand): Promise<void> {
      const authResult = memberAuthSession.getSnapshot().authResult

      if (!authResult) {
        throw new Error('当前未登录，无法保存昵称')
      }

      const nickname = command.nickname.trim()

      if (!nickname) {
        throw new Error('请输入用户昵称')
      }

      memberAuthSession.setAuthResult(
        buildNextAuthResultWithNickname(authResult, nickname),
        { persistence: resolvePersistence() },
      )
    },
  }
}
