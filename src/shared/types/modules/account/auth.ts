import type { OperationState } from '../base'

export interface AuthMerchantSupportedBalanceType {
  id: string
  name: string
  code: string | null
}

export interface AuthUserInfo {
  userId: string
  username: string
  nickname: string | null
  email: string | null
  mobile: string | null
  avatarUrl: string | null
  merchantId: string | null
  merchantName?: string | null
  merchantSupportedBalanceTypes?: AuthMerchantSupportedBalanceType[]
}

export type AccountCapability =
  | 'wechat-login'
  | 'wechat-mobile-bind'
  | 'wechat-scan-card'
  | 'recharge-card-payment'
  | 'payment-code'

export interface AccountSecurityState {
  hasBoundMobile: boolean
  hasPaymentPassword: boolean
  canResetPassword: boolean
}

export interface AuthSession {
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
}

export interface AuthResult {
  userInfo: AuthUserInfo
  session: AuthSession
  security: AccountSecurityState
  capabilities: AccountCapability[]
  isNewUser?: boolean
}

export interface PasswordResetPageData {
  currentMobile: string | null
  captchaImageUrl: string
  captchaLength: number
  smsCodeLength: number
  smsCountdownSeconds: number
  security: AccountSecurityState
  requestState: OperationState
}

export interface PasswordResetVerificationResult {
  verified: boolean
  nextStepUrl: string
}
