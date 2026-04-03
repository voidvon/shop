import { resolveBackendAWechatOauthUrl } from '@/shared/api/backend-a/backend-a-config'
import { backendTarget } from '@/shared/config/backend'

const wechatBrowserPattern = /MicroMessenger/i
const wechatLoginRedirectStorageKey = 'shop.member-auth.wechat-redirect'
const missingWechatOauthUrlMessage
  = '请从微信静默授权回调页进入当前登录页，或配置 VITE_BACKEND_A_WECHAT_OAUTH_URL'

export interface StartWechatOauthResult {
  message?: string
  started: boolean
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

export function startWechatOauthLogin(redirectPath?: string): StartWechatOauthResult {
  if (backendTarget !== 'backend-a') {
    return {
      started: false,
      message: '微信登录能力待接入',
    }
  }

  if (typeof window === 'undefined') {
    return {
      started: false,
      message: '当前环境不支持微信登录跳转',
    }
  }

  const oauthUrl = resolveBackendAWechatOauthUrl()

  if (!oauthUrl) {
    return {
      started: false,
      message: missingWechatOauthUrlMessage,
    }
  }

  savePendingWechatLoginRedirectPath(redirectPath)
  window.location.href = oauthUrl

  return {
    started: true,
  }
}
