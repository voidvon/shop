import { resolveBackendAWechatOauthUrl } from '@/shared/api/backend-a/backend-a-config'
import { getBackendRuntime } from '@/app/providers/backend/backend-runtime-provider'
import { backendTarget } from '@/shared/config/backend'

const wechatBrowserPattern = /MicroMessenger/i
const wechatLoginRedirectStorageKey = 'shop.member-auth.wechat-redirect'
const missingWechatOauthUrlMessage
  = '请从微信静默授权回调页进入当前登录页，或配置 VITE_BACKEND_A_WECHAT_OAUTH_URL'

export interface StartWechatOauthResult {
  message?: string
  redirected: boolean
  successMessage?: string
  succeeded: boolean
}

function canUseSessionStorage() {
  return typeof window !== 'undefined'
}

function normalizeRedirectPath(value: string | null | undefined) {
  return typeof value === 'string' && value.startsWith('/') ? value : null
}

export function isWechatBrowser(userAgent = globalThis.navigator?.userAgent ?? '') {
  return wechatBrowserPattern.test(userAgent)
}

export function readPendingWechatLoginRedirectPath() {
  if (!canUseSessionStorage()) {
    return null
  }

  return normalizeRedirectPath(window.sessionStorage.getItem(wechatLoginRedirectStorageKey))
}

export function savePendingWechatLoginRedirectPath(redirectPath: string | null | undefined) {
  if (!canUseSessionStorage()) {
    return
  }

  const normalizedRedirectPath = normalizeRedirectPath(redirectPath)

  if (!normalizedRedirectPath) {
    window.sessionStorage.removeItem(wechatLoginRedirectStorageKey)
    return
  }

  window.sessionStorage.setItem(wechatLoginRedirectStorageKey, normalizedRedirectPath)
}

export function consumePendingWechatLoginRedirectPath() {
  const redirectPath = readPendingWechatLoginRedirectPath()

  if (!canUseSessionStorage()) {
    return redirectPath
  }

  window.sessionStorage.removeItem(wechatLoginRedirectStorageKey)
  return redirectPath
}

function resolveWechatLoginSuccessMessage(authResult: {
  isNewUser?: boolean
  userInfo: {
    nickname: string | null
    username: string
  }
}) {
  const displayName = authResult.userInfo.nickname ?? authResult.userInfo.username

  return authResult.isNewUser
    ? `微信授权成功，已自动注册并登录 ${displayName}`
    : `登录成功，欢迎回来 ${displayName}`
}

export async function startWechatOauthLogin(redirectPath?: string): Promise<StartWechatOauthResult> {
  if (backendTarget === 'mock') {
    const runtime = getBackendRuntime()

    if (!runtime) {
      return {
        redirected: false,
        succeeded: false,
        message: '当前运行时未初始化',
      }
    }

    try {
      const authResult = await runtime.auth.repository.loginByWechatCode({
        code: `mock-wechat-${Date.now()}`,
      })

      runtime.auth.session.setAuthResult(authResult, {
        persistence: 'local',
      })

      return {
        redirected: false,
        succeeded: true,
        successMessage: resolveWechatLoginSuccessMessage(authResult),
      }
    } catch (error) {
      return {
        redirected: false,
        succeeded: false,
        message: error instanceof Error ? error.message : '微信登录失败',
      }
    }
  }

  if (typeof window === 'undefined') {
    return {
      redirected: false,
      succeeded: false,
      message: '当前环境不支持微信登录跳转',
    }
  }

  const oauthUrl = resolveBackendAWechatOauthUrl()

  if (!oauthUrl) {
    return {
      redirected: false,
      succeeded: false,
      message: missingWechatOauthUrlMessage,
    }
  }

  savePendingWechatLoginRedirectPath(redirectPath)
  window.location.href = oauthUrl

  return {
    redirected: true,
    succeeded: false,
  }
}
