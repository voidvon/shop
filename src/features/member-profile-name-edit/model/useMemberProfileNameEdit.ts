import { useMemberProfileService } from '@/entities/member-auth'

import { updateMemberProfileName } from '../application/update-member-profile-name'

export function useMemberProfileNameEdit() {
  const memberProfileService = useMemberProfileService()

  async function submitMemberProfileName(nickname: string) {
    return updateMemberProfileName(memberProfileService, { nickname })
  }

  return {
    updateMemberProfileName: submitMemberProfileName,
  }
}
