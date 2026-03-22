import type { MemberAuthRepository, MemberAuthSession } from '@/entities/member-auth'

import { normalizeMemberLoginDraft, type MemberLoginDraft } from '../domain/member-auth'

export interface SubmitMemberLoginResult {
  successMessage: string
}

interface SubmitMemberLoginDependencies {
  repository: MemberAuthRepository
  session: MemberAuthSession
}

export async function submitMemberLogin(
  input: MemberLoginDraft,
  dependencies: SubmitMemberLoginDependencies,
): Promise<SubmitMemberLoginResult> {
  const normalized = normalizeMemberLoginDraft(input)
  const authResult = await dependencies.repository.login({
    account: normalized.account,
    password: normalized.password,
    rememberLogin: normalized.rememberLogin,
  })
  dependencies.session.setAuthResult(authResult, {
    persistence: normalized.rememberLogin ? 'local' : 'session',
  })

  return {
    successMessage: `登录成功，欢迎回来 ${authResult.userInfo.nickname ?? authResult.userInfo.username}`,
  }
}
