import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'

import type { MemberAuthSession } from '../../../domain/member-auth-session'
import type {
  BindMemberMobileByWechatResult,
  MemberProfileService,
  UpdateMemberMobileCommand,
  UpdateMemberMobileResult,
  UpdateMemberNicknameCommand,
} from '../../../domain/member-profile-service'
import type { BackendAUserProfileDto } from '../../dto/backend-a-member-auth.dto'
import { mapBackendAUserProfileToAuthResult } from '../../mappers/backend-a-member-auth-mapper'
import {
  replaceMemberAuthSession,
  requireAuthenticatedAuthResult,
} from './backend-a-member-auth-session'

export function createBackendAMemberProfileService(memberAuthSession: MemberAuthSession): MemberProfileService {
  const httpClient = createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })

  function normalizeMobile(value: string) {
    return value.replace(/\D/g, '').slice(0, 11)
  }

  return {
    async bindMobileByWechat(): Promise<BindMemberMobileByWechatResult> {
      throw new Error('Backend A 当前 Swagger 未提供微信手机号绑定接口')
    },

    async updateMobile(command: UpdateMemberMobileCommand): Promise<UpdateMemberMobileResult> {
      const authResult = requireAuthenticatedAuthResult(memberAuthSession, '当前未登录，无法保存手机号')

      const mobile = normalizeMobile(command.mobile)

      if (!mobile) {
        throw new Error('请输入手机号')
      }

      if (!/^1\d{10}$/.test(mobile)) {
        throw new Error('请输入正确手机号')
      }

      const profile = await httpClient.patch<BackendAUserProfileDto>(
        '/api/v1/auth/profile',
        { mobile },
      )

      const nextAuthResult = mapBackendAUserProfileToAuthResult(profile, authResult.session, authResult)

      replaceMemberAuthSession(memberAuthSession, nextAuthResult)

      return {
        mobile: nextAuthResult.userInfo.mobile ?? mobile,
      }
    },

    async updateNickname(command: UpdateMemberNicknameCommand): Promise<void> {
      const authResult = requireAuthenticatedAuthResult(memberAuthSession, '当前未登录，无法保存昵称')

      const nickname = command.nickname.trim()

      if (!nickname) {
        throw new Error('请输入用户昵称')
      }

      const profile = await httpClient.patch<BackendAUserProfileDto>(
        '/api/v1/auth/profile',
        { nickname },
      )

      replaceMemberAuthSession(
        memberAuthSession,
        mapBackendAUserProfileToAuthResult(profile, authResult.session, authResult),
      )
    },
  }
}
