import type {
  ChangeMemberPaymentPasswordCommand,
  MemberSecurityService,
} from '@/entities/member-auth'

export async function changeMemberPayPassword(
  service: MemberSecurityService,
  command: ChangeMemberPaymentPasswordCommand,
): Promise<void> {
  return service.changePaymentPassword(command)
}
