import type { MemberAuthSession } from '@/entities/member-auth'

export interface LogoutMemberResult {
  successMessage: string
}

export async function logoutMember(session: MemberAuthSession): Promise<LogoutMemberResult> {
  session.clear()

  return {
    successMessage: '已退出当前账号',
  }
}
