import {
  backendAMemberAuthRepository,
  createBrowserMemberAuthSession,
  mockMemberAuthRepository,
  type MemberAuthRepository,
  type MemberAuthSession,
} from '@/entities/member-auth'
import {
  createBrowserMemberFavoriteRepository,
  type MemberFavoriteRepository,
} from '@/entities/member-favorite'
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
  createCheckoutFlowPort,
  type CheckoutFlowPort,
} from '@/processes/checkout-flow'
import {
  backendAMemberCenterQuery,
  mockMemberCenterQuery,
  type MemberCenterQuery,
} from '@/processes/member-center'
import {
  backendAStorefrontQuery,
  mockStorefrontQuery,
  type StorefrontQuery,
} from '@/processes/storefront'
import {
  backendATradeQuery,
  mockTradeQuery,
  type TradeQuery,
} from '@/processes/trade'
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
  auth: {
    repository: MemberAuthRepository
    session: MemberAuthSession
  }
  capabilities: BackendCapabilities
  enabledModules: FrontendModuleMap
  label: string
  queries: {
    checkoutFlow: CheckoutFlowPort
    memberCenter: MemberCenterQuery
    storefront: StorefrontQuery
    trade: TradeQuery
  }
  repositories: {
    cart: CartRepository
    memberFavorite: MemberFavoriteRepository
    order: OrderRepository
    product: ProductRepository
  }
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

function resolveMemberAuthRepository(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendAMemberAuthRepository
    case 'mock':
    default:
      return mockMemberAuthRepository
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

function resolveStorefrontQuery(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendAStorefrontQuery
    case 'mock':
    default:
      return mockStorefrontQuery
  }
}

function resolveTradeQuery(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendATradeQuery
    case 'mock':
    default:
      return mockTradeQuery
  }
}

function resolveMemberCenterQuery(type: BackendType) {
  switch (type) {
    case 'backend-a':
      return backendAMemberCenterQuery
    case 'mock':
    default:
      return mockMemberCenterQuery
  }
}

function resolveCheckoutFlowPort(type: BackendType, isCartEnabled: boolean) {
  return createCheckoutFlowPort({
    cartRepository: resolveCartRepository(type),
    isCartEnabled,
    orderRepository: resolveOrderRepository(type),
    productRepository: resolveProductRepository(type),
  })
}

export function createBackendRuntime(type = backendTarget): BackendRuntime {
  const supportedModules = supportedModulesByBackend[type]
  const enabledModules = resolveRuntimeEnabledModules(type)
  const memberAuthSession = createBrowserMemberAuthSession()
  const memberFavoriteRepository = createBrowserMemberFavoriteRepository()
  const repositories = {
    cart: resolveCartRepository(type),
    memberFavorite: memberFavoriteRepository,
    order: resolveOrderRepository(type),
    product: resolveProductRepository(type),
  }

  return {
    auth: {
      repository: resolveMemberAuthRepository(type),
      session: memberAuthSession,
    },
    capabilities: capabilitiesByBackend[type],
    enabledModules,
    label: getBackendLabel(type),
    queries: {
      checkoutFlow: resolveCheckoutFlowPort(type, enabledModules.cart),
      memberCenter: resolveMemberCenterQuery(type),
      storefront: resolveStorefrontQuery(type),
      trade: resolveTradeQuery(type),
    },
    repositories,
    supportedModules,
    type,
  }
}
