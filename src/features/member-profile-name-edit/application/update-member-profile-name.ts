import type {
  MemberProfileService,
  UpdateMemberNicknameCommand,
} from '@/entities/member-auth'

export async function updateMemberProfileName(
  service: MemberProfileService,
  command: UpdateMemberNicknameCommand,
): Promise<void> {
  return service.updateNickname(command)
}
