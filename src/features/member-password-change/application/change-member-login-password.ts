import type {
  ChangeMemberLoginPasswordCommand,
  MemberSecurityService,
} from '@/entities/member-auth'

export async function changeMemberLoginPassword(
  service: MemberSecurityService,
  command: ChangeMemberLoginPasswordCommand,
): Promise<void> {
  return service.changeLoginPassword(command)
}
