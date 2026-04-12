export interface BindMemberMobileByWechatResult {
  mobile: string
}

export interface UpdateMemberNicknameCommand {
  nickname: string
}

export interface UpdateMemberMobileCommand {
  mobile: string
}

export interface UpdateMemberMobileResult {
  mobile: string
}

export interface MemberProfileService {
  bindMobileByWechat(): Promise<BindMemberMobileByWechatResult>
  updateMobile(command: UpdateMemberMobileCommand): Promise<UpdateMemberMobileResult>
  updateNickname(command: UpdateMemberNicknameCommand): Promise<void>
}
