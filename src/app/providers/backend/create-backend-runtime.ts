import {
  backendACartRepository,
  mockCartRepository,
  type CartRepository,
} from '@/entities/cart'
import {
  backendAOrderRepository,
  mockOrderRepository,
  type OrderRepository,
} from '@/entities/order'
import {
  backendAProductRepository,
  mockProductRepository,
  type ProductRepository,
} from '@/entities/product'
import {
  backendAPageContentGateway,
  mockPageContentGateway,
  type PageContentGateway,
} from '@/shared/page-content'
import { backendTarget, getBackendLabel, type BackendType } from '@/shared/config/backend'
import {
  resolveRuntimeEnabledModules,
  supportedModulesByBackend,
  type FrontendModuleMap,
} from '@/shared/config/modules'

export interface BackendCapabilities {
  coupon: boolean
  memberPrice: boolean
}

export interface BackendRuntime {
  cartRepository: CartRepository
  capabilities: BackendCapabilities
  enabledModules: FrontendModuleMap
  label: string
  orderRepository: OrderRepository
  pageContentGateway: PageContentGateway
  productRepository: ProductRepository
  supportedModules: FrontendModuleMap
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

function resolveCartRepository(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendACartRepository
    case 'mock':
    default:
      return mockCartRepository
  }
}

function resolveOrderRepository(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendAOrderRepository
    case 'mock':
    default:
      return mockOrderRepository
  }
}

function resolvePageContentGateway(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendAPageContentGateway
    case 'mock':
    default:
      return mockPageContentGateway
  }
}

export function createBackendRuntime(type = backendTarget): BackendRuntime {
  const supportedModules = supportedModulesByBackend[type]
  const enabledModules = resolveRuntimeEnabledModules(type)

  return {
    cartRepository: resolveCartRepository(type),
    capabilities: capabilitiesByBackend[type],
    enabledModules,
    label: getBackendLabel(type),
    orderRepository: resolveOrderRepository(type),
    pageContentGateway: resolvePageContentGateway(type),
    productRepository: resolveProductRepository(type),
    supportedModules,
    type,
  }
}
