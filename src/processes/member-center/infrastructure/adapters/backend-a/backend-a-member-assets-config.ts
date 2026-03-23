function normalizeUrl(value: string | undefined) {
  const normalized = value?.trim()

  if (!normalized) {
    return null
  }

  return normalized.replace(/\/+$/, '')
}

function normalizeTimeout(value: string | undefined) {
  if (!value) {
    return 8000
  }

  const timeout = Number.parseInt(value, 10)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 8000
}

export function resolveBackendAMemberAssetsBaseUrl(
  rawValue = import.meta.env.VITE_BACKEND_A_MEMBER_ASSETS_BASE_URL,
) {
  return normalizeUrl(rawValue)
}

export function resolveBackendAMemberAssetsTimeoutMs(
  rawValue = import.meta.env.VITE_BACKEND_A_MEMBER_ASSETS_TIMEOUT_MS,
) {
  return normalizeTimeout(rawValue)
}
