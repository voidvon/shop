export interface BindMemberMobileByWechatResult {
  mobile: string
}

export interface UpdateMemberNicknameCommand {
  nickname: string
}

export interface MemberProfileService {
  bindMobileByWechat(): Promise<BindMemberMobileByWechatResult>
  updateNickname(command: UpdateMemberNicknameCommand): Promise<void>
}
