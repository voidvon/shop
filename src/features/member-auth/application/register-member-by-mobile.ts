import type { MemberAuthRepository, MemberAuthSession } from '@/entities/member-auth'

import { normalizeMemberMobileRegisterDraft, type MemberMobileRegisterDraft } from '../domain/member-auth'

export interface RegisterMemberByMobileResult {
  dialogMessage: string
  dialogTitle: string
}

interface RegisterMemberByMobileDependencies {
  repository: MemberAuthRepository
  session: MemberAuthSession
}

export async function registerMemberByMobile(
  input: MemberMobileRegisterDraft,
  dependencies: RegisterMemberByMobileDependencies,
): Promise<RegisterMemberByMobileResult> {
  const normalized = normalizeMemberMobileRegisterDraft(input)
  const authResult = await dependencies.repository.registerByMobile({
    mobile: normalized.mobile,
    smsCode: normalized.smsCode,
  })

  dependencies.session.setAuthResult(authResult, {
    persistence: 'local',
  })

  return {
    dialogMessage: `手机号已完成注册，并已自动登录为 ${authResult.userInfo.nickname ?? authResult.userInfo.username}。`,
    dialogTitle: '注册成功',
  }
}
