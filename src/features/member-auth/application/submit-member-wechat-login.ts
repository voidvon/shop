import type { MemberAuthRepository, MemberAuthSession } from '@/entities/member-auth'

export interface SubmitMemberWechatLoginResult {
  successMessage: string
}

interface SubmitMemberWechatLoginDependencies {
  repository: MemberAuthRepository
  session: MemberAuthSession
}

export async function submitMemberWechatLogin(
  code: string,
  dependencies: SubmitMemberWechatLoginDependencies,
): Promise<SubmitMemberWechatLoginResult> {
  const normalizedCode = code.trim()

  if (!normalizedCode) {
    throw new Error('缺少微信授权 code')
  }

  const authResult = await dependencies.repository.loginByWechatCode({
    code: normalizedCode,
  })

  dependencies.session.setAuthResult(authResult, {
    persistence: 'local',
  })

  return {
    successMessage: authResult.isNewUser
      ? `微信授权成功，已自动注册并登录 ${authResult.userInfo.nickname ?? authResult.userInfo.username}`
      : `登录成功，欢迎回来 ${authResult.userInfo.nickname ?? authResult.userInfo.username}`,
  }
}
