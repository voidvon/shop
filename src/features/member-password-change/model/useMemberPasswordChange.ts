import { useMemberSecurityService } from '@/entities/member-auth'

import { changeMemberLoginPassword } from '../application/change-member-login-password'

export function useMemberPasswordChange() {
  const memberSecurityService = useMemberSecurityService()

  async function submitMemberLoginPassword(command: {
    confirmPassword: string
    currentPassword: string
    newPassword: string
  }) {
    return changeMemberLoginPassword(memberSecurityService, command)
  }

  return {
    changeMemberLoginPassword: submitMemberLoginPassword,
  }
}
