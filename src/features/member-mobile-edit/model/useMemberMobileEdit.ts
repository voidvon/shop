import {
  useMemberProfileService,
  type UpdateMemberMobileCommand,
  type UpdateMemberMobileResult,
} from '@/entities/member-auth'

import { updateMemberMobile } from '../application/update-member-mobile'

export function useMemberMobileEdit() {
  const memberProfileService = useMemberProfileService()

  async function submitUpdateMemberMobile(
    command: UpdateMemberMobileCommand,
  ): Promise<UpdateMemberMobileResult> {
    return updateMemberMobile(memberProfileService, command)
  }

  return {
    updateMemberMobile: submitUpdateMemberMobile,
  }
}
