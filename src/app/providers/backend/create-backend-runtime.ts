import {
  backendAProductRepository,
  mockProductRepository,
  type ProductRepository,
} from '@/entities/product'
import { backendTarget, getBackendLabel, type BackendType } from '@/shared/config/backend'

export interface BackendCapabilities {
  coupon: boolean
  memberPrice: boolean
}

export interface BackendRuntime {
  capabilities: BackendCapabilities
  label: string
  productRepository: ProductRepository
  type: BackendType
}

const capabilitiesByBackend: Record<BackendType, BackendCapabilities> = {
  mock: {
    coupon: false,
    memberPrice: false,
  },
  'backend-a': {
    coupon: true,
    memberPrice: true,
  },
}

function resolveProductRepository(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendAProductRepository
    case 'mock':
    default:
      return mockProductRepository
  }
}

export function createBackendRuntime(type = backendTarget): BackendRuntime {
  return {
    capabilities: capabilitiesByBackend[type],
    label: getBackendLabel(type),
    productRepository: resolveProductRepository(type),
    type,
  }
}
