import type { AuthResult } from '@/shared/types/modules'

import type { MemberAuthSessionPersistence } from '../../../domain/member-auth'
import type { MemberAuthSession } from '../../../domain/member-auth-session'
import type {
  ChangeMemberLoginPasswordCommand,
  ChangeMemberPaymentPasswordCommand,
  MemberSecurityService,
} from '../../../domain/member-security-service'

function resolvePersistence(): MemberAuthSessionPersistence {
  if (typeof window === 'undefined') {
    return 'local'
  }

  return window.localStorage.getItem('shop.member-auth.session')
    ? 'local'
    : 'session'
}

function assertAuthenticated(authResult: AuthResult | null): asserts authResult is AuthResult {
  if (!authResult) {
    throw new Error('当前未登录，无法修改账户安全信息')
  }
}

function updateHasPaymentPassword(authResult: AuthResult): AuthResult {
  return {
    ...authResult,
    security: {
      ...authResult.security,
      hasPaymentPassword: true,
    },
  }
}

function validateChangePassword(
  command: ChangeMemberLoginPasswordCommand | ChangeMemberPaymentPasswordCommand,
  options: {
    emptyMessage: string
    invalidMessage: string
    validateNewPassword: (value: string) => boolean
  },
) {
  if (!command.currentPassword.trim() || !command.newPassword.trim() || !command.confirmPassword.trim()) {
    throw new Error(options.emptyMessage)
  }

  if (!options.validateNewPassword(command.newPassword) || !options.validateNewPassword(command.confirmPassword)) {
    throw new Error(options.invalidMessage)
  }

  if (command.newPassword !== command.confirmPassword) {
    throw new Error('两次输入的新密码不一致')
  }
}

export function createMockMemberSecurityService(memberAuthSession: MemberAuthSession): MemberSecurityService {
  return {
    async changeLoginPassword(command) {
      assertAuthenticated(memberAuthSession.getSnapshot().authResult)

      validateChangePassword(command, {
        emptyMessage: '请完整填写登录密码信息',
        invalidMessage: '新密码至少 6 位',
        validateNewPassword: (value) => value.length >= 6,
      })
    },

    async changePaymentPassword(command) {
      const authResult = memberAuthSession.getSnapshot().authResult
      assertAuthenticated(authResult)

      validateChangePassword(command, {
        emptyMessage: '请完整填写支付密码信息',
        invalidMessage: '支付密码需为 6 位数字',
        validateNewPassword: (value) => /^\d{6}$/.test(value),
      })

      memberAuthSession.setAuthResult(
        updateHasPaymentPassword(authResult),
        { persistence: resolvePersistence() },
      )
    },
  }
}
