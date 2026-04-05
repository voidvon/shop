const defaultBackendABaseUrl = 'https://api.qzxys.com'
const defaultBackendATimeoutMs = 8000
const defaultBackendAWechatAppId = 'wx057d684ef1e02d1c'
const defaultBackendAWechatOauthScope = 'snsapi_base'

function normalizeUrl(value: string | undefined) {
  const normalized = value?.trim()

  if (!normalized) {
    return null
  }

  return normalized.replace(/\/+$/, '')
}

function normalizeTimeout(value: string | undefined) {
  if (!value) {
    return defaultBackendATimeoutMs
  }

  const timeout = Number.parseInt(value, 10)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : defaultBackendATimeoutMs
}

function normalizeOptionalUrl(value: string | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function resolveBackendABaseUrl(
  rawValue = import.meta.env.VITE_BACKEND_A_BASE_URL,
) {
  return normalizeUrl(rawValue) ?? defaultBackendABaseUrl
}

export function resolveBackendATimeoutMs(
  rawValue = import.meta.env.VITE_BACKEND_A_TIMEOUT_MS,
) {
  return normalizeTimeout(rawValue)
}

export function resolveBackendAWechatOauthUrl(
  rawValue = import.meta.env.VITE_BACKEND_A_WECHAT_OAUTH_URL,
) {
  return normalizeOptionalUrl(rawValue)
}

export function resolveBackendAWechatAppId(
  rawValue = import.meta.env.VITE_BACKEND_A_WECHAT_APP_ID,
) {
  return normalizeOptionalUrl(rawValue) ?? defaultBackendAWechatAppId
}

export function resolveBackendAWechatOauthScope(
  rawValue = import.meta.env.VITE_BACKEND_A_WECHAT_OAUTH_SCOPE,
) {
  return normalizeOptionalUrl(rawValue) ?? defaultBackendAWechatOauthScope
}

export function resolveBackendAMediaUrl(
  value: string | null | undefined,
  baseUrl = resolveBackendABaseUrl(),
) {
  if (!value) {
    return null
  }

  try {
    return new URL(value, `${baseUrl}/`).toString()
  } catch {
    return value
  }
}
