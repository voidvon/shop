const backendTypes = ['mock', 'backend-a'] as const

export type BackendType = (typeof backendTypes)[number]

const backendLabels: Record<BackendType, string> = {
  mock: 'Mock Repository',
  'backend-a': 'Backend A Adapter',
}

function resolveBoolean(rawValue: string | undefined, fallback: boolean) {
  if (!rawValue) {
    return fallback
  }

  const normalized = rawValue.trim().toLowerCase()

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  return fallback
}

function isBackendType(value: string): value is BackendType {
  return backendTypes.includes(value as BackendType)
}

export function resolveBackendType(rawValue = import.meta.env.VITE_BACKEND_TARGET): BackendType {
  return rawValue && isBackendType(rawValue) ? rawValue : 'mock'
}

export const backendTarget = resolveBackendType()

export function getBackendLabel(type: BackendType) {
  return backendLabels[type]
}

export const currentBackendLabel = getBackendLabel(backendTarget)

export function resolveBackendAInvoiceEnabled(
  rawValue = import.meta.env.VITE_BACKEND_A_ENABLE_INVOICE,
) {
  return resolveBoolean(rawValue, false)
}

export function resolveBackendALogisticsEnabled(
  rawValue = import.meta.env.VITE_BACKEND_A_ENABLE_LOGISTICS,
) {
  return resolveBoolean(rawValue, false)
}
