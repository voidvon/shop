import {
  bindMemberCard,
  lookupMemberCard,
  useMemberAssetsService,
  type BindMemberCardCommand,
} from '@/processes/member-center'

export function useMemberCardBinding() {
  const memberAssetsService = useMemberAssetsService()

  async function submitBindMemberCard(command: BindMemberCardCommand) {
    return bindMemberCard(memberAssetsService, command)
  }

  async function previewMemberCard(command: BindMemberCardCommand) {
    return lookupMemberCard(memberAssetsService, command)
  }

  return {
    bindMemberCard: submitBindMemberCard,
    lookupMemberCard: previewMemberCard,
  }
}
