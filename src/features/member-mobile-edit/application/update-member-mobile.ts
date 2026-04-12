import type {
  MemberProfileService,
  UpdateMemberMobileCommand,
  UpdateMemberMobileResult,
} from '@/entities/member-auth'

export async function updateMemberMobile(
  service: MemberProfileService,
  command: UpdateMemberMobileCommand,
): Promise<UpdateMemberMobileResult> {
  return service.updateMobile(command)
}
