export interface AuthUserInfo {
  userId: string
  username: string
  email: string | null
  mobile: string | null
  avatarUrl: string | null
}

export interface AuthResult {
  userInfo: AuthUserInfo
  token: string
}

export interface PasswordResetPageData {
  currentMobile: string | null
  captchaImageUrl: string
  smsCountdownSeconds: number
}

export interface PasswordResetVerificationResult {
  verified: boolean
  nextStepUrl: string
}
