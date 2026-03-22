import type { MemberAuthRepository, MemberAuthSession } from '@/entities/member-auth'

import { normalizeMemberRegisterDraft, type MemberRegisterDraft } from '../domain/member-auth'

export interface RegisterMemberAccountResult {
  dialogMessage: string
  dialogTitle: string
}

interface RegisterMemberAccountDependencies {
  repository: MemberAuthRepository
  session: MemberAuthSession
}

export async function registerMemberAccount(
  input: MemberRegisterDraft,
  dependencies: RegisterMemberAccountDependencies,
): Promise<RegisterMemberAccountResult> {
  const normalized = normalizeMemberRegisterDraft(input)
  const authResult = await dependencies.repository.registerByAccount({
    email: normalized.email,
    password: normalized.password,
    username: normalized.username,
  })

  dependencies.session.setAuthResult(authResult, {
    persistence: 'local',
  })

  return {
    dialogMessage: `账号已创建，并已自动登录为 ${authResult.userInfo.nickname ?? authResult.userInfo.username}。`,
    dialogTitle: '注册成功',
  }
}
