import type { MemberAuthRepository } from '@/entities/member-auth'

import { normalizeMemberMobileRegisterDraft, type MemberMobileRegisterDraft } from '../domain/member-auth'

export interface RequestMemberRegisterSmsCodeResult {
  countdownSeconds: number
  successMessage: string
}

interface RequestMemberRegisterSmsCodeDependencies {
  repository: MemberAuthRepository
}

export async function requestMemberRegisterSmsCode(
  input: Pick<MemberMobileRegisterDraft, 'captcha' | 'mobile'>,
  dependencies: RequestMemberRegisterSmsCodeDependencies,
): Promise<RequestMemberRegisterSmsCodeResult> {
  const normalized = normalizeMemberMobileRegisterDraft({
    agreement: true,
    captcha: input.captcha,
    mobile: input.mobile,
    smsCode: '',
  })

  return dependencies.repository.requestRegisterSmsCode({
    captcha: normalized.captcha,
    mobile: normalized.mobile,
  })
}
