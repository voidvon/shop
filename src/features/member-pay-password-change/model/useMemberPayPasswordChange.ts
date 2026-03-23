import { useMemberSecurityService } from '@/entities/member-auth'

import { changeMemberPayPassword } from '../application/change-member-pay-password'

export function useMemberPayPasswordChange() {
  const memberSecurityService = useMemberSecurityService()

  async function submitMemberPayPassword(command: {
    confirmPassword: string
    currentPassword: string
    newPassword: string
  }) {
    return changeMemberPayPassword(memberSecurityService, command)
  }

  return {
    changeMemberPayPassword: submitMemberPayPassword,
  }
}
