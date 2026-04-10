export interface BackendAMerchantSimpleDto {
  id?: number | string | null
  logo?: string | null
  name?: string | null
  short_name?: string | null
}

export interface BackendAUserProfileDto {
  avatar: string | null
  created_at: string | null
  id: number
  last_login_at: string | null
  mobile: string | null
  merchant?: BackendAMerchantSimpleDto | null
  merchant_id?: number | string | null
  merchantId?: number | string | null
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
