export interface ChangeMemberLoginPasswordCommand {
  confirmPassword: string
  currentPassword: string
  newPassword: string
}

export interface ChangeMemberPaymentPasswordCommand {
  confirmPassword: string
  currentPassword: string
  newPassword: string
}

export interface MemberSecurityService {
  changeLoginPassword(command: ChangeMemberLoginPasswordCommand): Promise<void>
  changePaymentPassword(command: ChangeMemberPaymentPasswordCommand): Promise<void>
}
