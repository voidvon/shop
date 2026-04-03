import {
  resolveBackendAWechatAppId,
  resolveBackendAWechatOauthScope,
  resolveBackendAWechatOauthUrl,
} from '@/shared/api/backend-a/backend-a-config'
import { getBackendRuntime } from '@/app/providers/backend/backend-runtime-provider'
import { backendTarget } from '@/shared/config/backend'

const wechatBrowserPattern = /MicroMessenger/i
const wechatLoginRedirectStorageKey = 'shop.member-auth.wechat-redirect'
const wechatLoginStateStorageKey = 'shop.member-auth.wechat-state'
const missingWechatOauthUrlMessage
  = '请配置 VITE_BACKEND_A_WECHAT_OAUTH_URL，或提供可用的微信公众号 AppID'

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

export function readPendingWechatLoginState() {
  if (!canUseSessionStorage()) {
    return null
  }

  return window.sessionStorage.getItem(wechatLoginStateStorageKey)
}

export function consumePendingWechatLoginState() {
  const state = readPendingWechatLoginState()

  if (!canUseSessionStorage()) {
    return state
  }

  window.sessionStorage.removeItem(wechatLoginStateStorageKey)
  return state
}

function savePendingWechatLoginState(state: string) {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.setItem(wechatLoginStateStorageKey, state)
}

function buildWechatOauthState() {
  return `shop-wechat-${Date.now()}`
}

function buildWechatOauthCallbackUrl(redirectPath?: string) {
  const callbackUrl = new URL('/member/login', window.location.origin)
  const normalizedRedirectPath = normalizeRedirectPath(redirectPath)

  if (normalizedRedirectPath) {
    callbackUrl.searchParams.set('redirect', normalizedRedirectPath)
  }

  return callbackUrl.toString()
}

function buildWechatOauthUrl(redirectPath?: string) {
  const oauthUrl = resolveBackendAWechatOauthUrl()

  if (oauthUrl) {
    return oauthUrl
  }

  const appId = resolveBackendAWechatAppId()

  if (!appId) {
    return null
  }

  const state = buildWechatOauthState()
  const authorizeUrl = new URL('https://open.weixin.qq.com/connect/oauth2/authorize')

  authorizeUrl.searchParams.set('appid', appId)
  authorizeUrl.searchParams.set('redirect_uri', buildWechatOauthCallbackUrl(redirectPath))
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('scope', resolveBackendAWechatOauthScope())
  authorizeUrl.searchParams.set('state', state)

  savePendingWechatLoginState(state)
  return `${authorizeUrl.toString()}#wechat_redirect`
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

  const oauthUrl = buildWechatOauthUrl(redirectPath)

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
