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
  createBrowserMemberAddressRepository,
  type MemberAddressRepository,
} from '@/entities/member-address'
import {
  createBrowserCartRepository,
  type CartRepository,
} from '@/entities/cart'
import {
  createBrowserOrderRepository,
  type OrderRepository,
} from '@/entities/order'
import {
  getBackendAOrderSeedRecords,
} from '@/entities/order/infrastructure/adapters/backend-a/backend-a-order-repository'
import {
  getMockOrderSeedRecords,
} from '@/entities/order/infrastructure/adapters/mock/mock-order-repository'
import {
  readBrowserOrderRecords,
} from '@/entities/order/infrastructure/browser-order-storage'
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
  createBackendAMemberCenterQuery,
  createMockMemberCenterQuery,
  type MemberCenterQuery,
} from '@/processes/member-center'
import {
  backendAStorefrontQuery,
  mockStorefrontQuery,
  type StorefrontQuery,
} from '@/processes/storefront'
import {
  createTradeQuery,
  type TradeQuery,
} from '@/processes/trade'
import {
  createBrowserOrderListPageDataReader,
} from '@/processes/trade/infrastructure/create-browser-order-list-page-data-reader'
import {
  mapBackendACartPageData,
} from '@/processes/trade/infrastructure/mappers/backend-a-trade-mapper'
import {
  mapMockCartPageData,
} from '@/processes/trade/infrastructure/mappers/mock-trade-mapper'
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
    memberAddress: MemberAddressRepository
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

function resolveCartRepository(memberAuthSession: MemberAuthSession) {
  return createBrowserCartRepository({
    getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
  })
}

function resolveMemberAddressRepository(memberAuthSession: MemberAuthSession) {
  return createBrowserMemberAddressRepository({
    getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
  })
}

function resolveOrderRepository(type: BackendType, memberAuthSession: MemberAuthSession) {
  switch (type) {
    case 'backend-a':
      return createBrowserOrderRepository({
        defaultStoreName: 'Backend A 选品馆',
        getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
        getSeedRecords: getBackendAOrderSeedRecords,
        namespace: 'backend-a',
        resolveDiscount: (command) => {
          const subtotal = command.lines.reduce((sum, line) => sum + line.lineTotal, 0)
          return command.source === 'cart' ? Math.round(subtotal * 0.08) : Math.round(subtotal * 0.05)
        },
      })
    case 'mock':
    default:
      return createBrowserOrderRepository({
        defaultStoreName: '模拟订单',
        getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
        getSeedRecords: getMockOrderSeedRecords,
        namespace: 'mock',
      })
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

function resolveTradeQuery(
  type: BackendType,
  cartRepository: CartRepository,
  memberAuthSession: MemberAuthSession,
) {
  switch (type) {
    case 'backend-a':
      return createTradeQuery({
        cartRepository,
        getOrderListPageData: createBrowserOrderListPageDataReader({
          readOrders: () => readBrowserOrderRecords(
            'backend-a',
            memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
            getBackendAOrderSeedRecords,
          ),
        }),
        mapCartPageData: mapBackendACartPageData,
      })
    case 'mock':
    default:
      return createTradeQuery({
        cartRepository,
        getOrderListPageData: createBrowserOrderListPageDataReader({
          readOrders: () => readBrowserOrderRecords(
            'mock',
            memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
            getMockOrderSeedRecords,
          ),
        }),
        mapCartPageData: mapMockCartPageData,
      })
  }
}

function resolveMemberCenterQuery(type: BackendType, memberAuthSession: MemberAuthSession) {
  switch (type) {
    case 'backend-a':
      return createBackendAMemberCenterQuery(memberAuthSession)
    case 'mock':
    default:
      return createMockMemberCenterQuery(memberAuthSession)
  }
}

export function createBackendRuntime(type = backendTarget): BackendRuntime {
  const supportedModules = supportedModulesByBackend[type]
  const enabledModules = resolveRuntimeEnabledModules(type)
  const memberAuthSession = createBrowserMemberAuthSession()
  const cartRepository = resolveCartRepository(memberAuthSession)
  const memberAddressRepository = resolveMemberAddressRepository(memberAuthSession)
  const memberFavoriteRepository = createBrowserMemberFavoriteRepository()
  const repositories = {
    cart: cartRepository,
    memberAddress: memberAddressRepository,
    memberFavorite: memberFavoriteRepository,
    order: resolveOrderRepository(type, memberAuthSession),
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
      checkoutFlow: createCheckoutFlowPort({
        cartRepository,
        isCartEnabled: enabledModules.cart,
        orderRepository: repositories.order,
        productRepository: repositories.product,
      }),
      memberCenter: resolveMemberCenterQuery(type, memberAuthSession),
      storefront: resolveStorefrontQuery(type),
      trade: resolveTradeQuery(type, cartRepository, memberAuthSession),
    },
    repositories,
    supportedModules,
    type,
  }
}
