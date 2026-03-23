import {
  useMemberProfileService,
  type BindMemberMobileByWechatResult,
} from '@/entities/member-auth'

import { bindMemberMobileByWechat } from '../application/bind-member-mobile-by-wechat'

export function useMemberMobileBinding() {
  const memberProfileService = useMemberProfileService()

  async function submitBindMemberMobileByWechat(): Promise<BindMemberMobileByWechatResult> {
    return bindMemberMobileByWechat(memberProfileService)
  }

  return {
    bindMemberMobileByWechat: submitBindMemberMobileByWechat,
  }
}
