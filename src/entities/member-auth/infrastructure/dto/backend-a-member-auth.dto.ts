export interface BackendAUserProfileDto {
  avatar: string | null
  created_at: string | null
  id: number
  last_login_at: string | null
  mobile: string | null
  name: string
  nickname: string
  openid: string
  status: number
  unionid: string | null
  updated_at: string | null
}

export interface BackendAWechatLoginDataDto {
  is_new_user: boolean
  token: string
  token_type: string
  user: BackendAUserProfileDto
}
