import type { AuthResult } from '@/shared/types/modules'

export interface MemberLoginCommand {
  account: string
  password: string
  rememberLogin: boolean
}

export interface MemberRegisterCommand {
  email: string
  password: string
  username: string
}

export interface MemberMobileRegisterCommand {
  mobile: string
  smsCode: string
}

export interface MemberRegisterSmsCodeCommand {
  captcha: string
  mobile: string
}

export interface MemberRegisterSmsCodeResult {
  countdownSeconds: number
  successMessage: string
}

export interface MemberWechatLoginCommand {
  code: string
}

export type MemberAuthSessionPersistence = 'local' | 'session'

export interface MemberAuthSessionSnapshot {
  authResult: AuthResult | null
  isAuthenticated: boolean
}

export function createGuestMemberAuthSessionSnapshot(): MemberAuthSessionSnapshot {
  return {
    authResult: null,
    isAuthenticated: false,
  }
}

export function createMemberAuthSessionSnapshot(
  authResult: AuthResult | null,
): MemberAuthSessionSnapshot {
  if (!authResult) {
    return createGuestMemberAuthSessionSnapshot()
  }

  return {
    authResult,
    isAuthenticated: true,
  }
}
