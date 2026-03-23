import type { MemberAuthSession } from '../../../domain/member-auth-session'
import type {
  ChangeMemberLoginPasswordCommand,
  ChangeMemberPaymentPasswordCommand,
  MemberSecurityService,
} from '../../../domain/member-security-service'
import { requireAuthenticatedAuthResult } from './backend-a-member-auth-session'

function validateChangePassword(
  command: ChangeMemberLoginPasswordCommand | ChangeMemberPaymentPasswordCommand,
  options: {
    emptyMessage: string
    invalidMessage: string
    mismatchMessage?: string
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
    throw new Error(options.mismatchMessage ?? '两次输入的新密码不一致')
  }
}

export function createBackendAMemberSecurityService(memberAuthSession: MemberAuthSession): MemberSecurityService {
  return {
    async changeLoginPassword(command) {
      requireAuthenticatedAuthResult(memberAuthSession, '当前未登录，无法修改账户安全信息')

      validateChangePassword(command, {
        emptyMessage: '请完整填写登录密码信息',
        invalidMessage: '新密码至少 6 位',
        validateNewPassword: (value) => value.length >= 6,
      })

      throw new Error('Backend A 当前 Swagger 未提供登录密码修改接口')
    },

    async changePaymentPassword(command) {
      requireAuthenticatedAuthResult(memberAuthSession, '当前未登录，无法修改账户安全信息')

      validateChangePassword(command, {
        emptyMessage: '请完整填写支付密码信息',
        invalidMessage: '支付密码需为 6 位数字',
        mismatchMessage: '两次输入的支付密码不一致',
        validateNewPassword: (value) => /^\d{6}$/.test(value),
      })

      throw new Error('Backend A 当前 Swagger 未提供支付密码修改接口')
    },
  }
}
