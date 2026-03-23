import type { AuthResult } from '@/shared/types/modules'

import type { MemberAuthSessionPersistence } from '../../../domain/member-auth'
import type { MemberAuthSession } from '../../../domain/member-auth-session'
import type {
  BindMemberMobileByWechatResult,
  MemberProfileService,
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

function createBackendAWechatMobile() {
  const seed = `${Date.now()}`.slice(-8)
  return `138${seed}`
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

export function createBackendAMemberProfileService(memberAuthSession: MemberAuthSession): MemberProfileService {
  return {
    async bindMobileByWechat(): Promise<BindMemberMobileByWechatResult> {
      const authResult = memberAuthSession.getSnapshot().authResult

      if (!authResult) {
        throw new Error('当前未登录，无法绑定手机号')
      }

      if (!authResult.capabilities.includes('wechat-mobile-bind')) {
        throw new Error('当前后端暂未接入微信手机号授权')
      }

      const mobile = authResult.userInfo.mobile ?? createBackendAWechatMobile()

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
