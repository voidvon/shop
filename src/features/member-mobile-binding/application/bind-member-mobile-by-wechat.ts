import type {
  BindMemberMobileByWechatResult,
  MemberProfileService,
} from '@/entities/member-auth'

export async function bindMemberMobileByWechat(
  service: MemberProfileService,
): Promise<BindMemberMobileByWechatResult> {
  return service.bindMobileByWechat()
}
