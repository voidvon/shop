import type {
  BindMemberCardCommand,
  MemberAssetsService,
} from '../domain/member-assets-service'

export async function bindMemberCard(
  service: MemberAssetsService,
  command: BindMemberCardCommand,
) {
  return service.bindMemberCard(command)
}
