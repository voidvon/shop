import { backendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'

import type { MemberAuthRepository } from '../../../domain/member-auth-repository'
import type { BackendAWechatLoginDataDto } from '../../dto/backend-a-member-auth.dto'
import { mapBackendAWechatLoginDataDto } from '../../mappers/backend-a-member-auth-mapper'

const backendAWechatOnlyMessage = 'Backend A 当前只支持微信公众号静默授权登录'

export const backendAMemberAuthRepository: MemberAuthRepository = {
  async login() {
    throw new Error(`${backendAWechatOnlyMessage}，账号密码登录未在当前 Swagger 中提供`)
  },

  async loginByWechatCode(command) {
    const code = command.code.trim()

    if (!code) {
      throw new Error('缺少微信授权 code')
    }

    const response = await backendAHttpClient.post<BackendAWechatLoginDataDto>(
      '/api/v1/auth/wechat',
      { code },
    )

    return mapBackendAWechatLoginDataDto(response)
  },

  async registerByAccount() {
    throw new Error(`${backendAWechatOnlyMessage}，普通注册未在当前 Swagger 中提供`)
  },

  async registerByMobile() {
    throw new Error(`${backendAWechatOnlyMessage}，手机号注册未在当前 Swagger 中提供`)
  },

  async requestRegisterSmsCode() {
    throw new Error('Backend A 当前 Swagger 未提供注册短信验证码接口')
  },
}
