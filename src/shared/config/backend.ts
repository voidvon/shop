const backendTypes = ['mock', 'backend-a'] as const

export type BackendType = (typeof backendTypes)[number]

const backendLabels: Record<BackendType, string> = {
  mock: 'Mock Repository',
  'backend-a': 'Backend A Adapter',
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
