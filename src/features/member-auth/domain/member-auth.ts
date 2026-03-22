export type MemberRegisterMode = 'default' | 'mobile'

export interface MemberLoginDraft {
  account: string
  password: string
  rememberLogin: boolean
}

export interface MemberRegisterDraft {
  agreement: boolean
  confirmPassword: string
  email: string
  password: string
  username: string
}

export interface MemberMobileRegisterDraft {
  agreement: boolean
  captcha: string
  mobile: string
  smsCode: string
}

export function normalizeMemberAuthText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeCaptchaText(value: unknown) {
  return normalizeMemberAuthText(value).toUpperCase()
}

export function isMemberEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isMemberMobile(value: string) {
  return /^1\d{10}$/.test(value)
}

export function hasConfirmedPassword(password: string, confirmPassword: string) {
  return normalizeMemberAuthText(password) === normalizeMemberAuthText(confirmPassword)
}

export function hasAcceptedAgreement(value: boolean) {
  return value === true
}

export function isMatchedCaptcha(input: string, expected: string) {
  return normalizeCaptchaText(input) === normalizeCaptchaText(expected)
}

export function normalizeMemberLoginDraft(input: MemberLoginDraft): MemberLoginDraft {
  return {
    ...input,
    account: normalizeMemberAuthText(input.account),
    password: normalizeMemberAuthText(input.password),
  }
}

export function normalizeMemberRegisterDraft(input: MemberRegisterDraft): MemberRegisterDraft {
  return {
    ...input,
    confirmPassword: normalizeMemberAuthText(input.confirmPassword),
    email: normalizeMemberAuthText(input.email),
    password: normalizeMemberAuthText(input.password),
    username: normalizeMemberAuthText(input.username),
  }
}

export function normalizeMemberMobileRegisterDraft(
  input: MemberMobileRegisterDraft,
): MemberMobileRegisterDraft {
  return {
    ...input,
    captcha: normalizeCaptchaText(input.captcha),
    mobile: normalizeMemberAuthText(input.mobile),
    smsCode: normalizeMemberAuthText(input.smsCode),
  }
}
