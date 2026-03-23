import {
  bindMemberCard,
  useMemberAssetsService,
  type BindMemberCardCommand,
} from '@/processes/member-center'

export function useMemberCardBinding() {
  const memberAssetsService = useMemberAssetsService()

  async function submitBindMemberCard(command: BindMemberCardCommand) {
    return bindMemberCard(memberAssetsService, command)
  }

  return {
    bindMemberCard: submitBindMemberCard,
  }
}
