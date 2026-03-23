import {
  backendAMemberAuthRepository,
  createBackendAMemberProfileService,
  createBackendAMemberSecurityService,
  createBrowserMemberAuthSession,
  createMockMemberProfileService,
  createMockMemberSecurityService,
  mockMemberAuthRepository,
  type MemberAuthRepository,
  type MemberProfileService,
  type MemberSecurityService,
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
  createBrowserAfterSaleRepository,
  type AfterSaleRecord,
  type AfterSaleRepository,
  type AfterSaleSnapshot,
} from '@/entities/after-sale'
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
  createBackendAMemberAssetsService,
  createBackendAMemberCenterQuery,
  createMockMemberCenterQuery,
  createMockMemberAssetsService,
  type MemberAssetsService,
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
  createBrowserOrderDetailPageDataReader,
} from '@/processes/trade/infrastructure/create-browser-order-detail-page-data-reader'
import {
  mapBackendACartPageData,
} from '@/processes/trade/infrastructure/mappers/backend-a-trade-mapper'
import {
  mapMockCartPageData,
} from '@/processes/trade/infrastructure/mappers/mock-trade-mapper'
import { getMockStore, mockTradeData } from '@/shared/mocks'
import { backendTarget, getBackendLabel, type BackendType } from '@/shared/config/backend'
import {
  resolveRuntimeEnabledModules,
  supportedModulesByBackend,
  type FrontendModuleMap,
} from '@/shared/config/modules'
import type { AfterSaleListPageData } from '@/shared/types/modules'

export interface BackendCapabilities {
  coupon: boolean
  memberPrice: boolean
}

export interface BackendRuntime {
  auth: {
    profileService: MemberProfileService
    repository: MemberAuthRepository
    securityService: MemberSecurityService
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
  services: {
    memberAssets: MemberAssetsService
  }
  repositories: {
    afterSale: AfterSaleRepository
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

function resolveMemberProfileService(type: BackendType, memberAuthSession: MemberAuthSession) {
  switch (type) {
    case 'backend-a':
      return createBackendAMemberProfileService(memberAuthSession)
    case 'mock':
    default:
      return createMockMemberProfileService(memberAuthSession)
  }
}

function resolveMemberSecurityService(type: BackendType, memberAuthSession: MemberAuthSession) {
  switch (type) {
    case 'backend-a':
      return createBackendAMemberSecurityService(memberAuthSession)
    case 'mock':
    default:
      return createMockMemberSecurityService(memberAuthSession)
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

function resolveMemberAssetsService(type: BackendType, memberAuthSession: MemberAuthSession) {
  switch (type) {
    case 'backend-a':
      return createBackendAMemberAssetsService(memberAuthSession)
    case 'mock':
    default:
      return createMockMemberAssetsService(memberAuthSession)
  }
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

function createEmptyAfterSaleListPageData(): AfterSaleListPageData {
  return {
    query: {
      page: 1,
      pageSize: 10,
      type: 'refund' as const,
    },
    refundPage: {
      hasMore: false,
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
    },
    returnPage: {
      hasMore: false,
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
    },
  }
}

function createSeedRefundRecord(item: typeof mockTradeData.afterSaleListPageData.refundPage.list[number]): AfterSaleRecord {
  const detail = mockTradeData.refundDetailPageDataById[item.refundId] ?? null

  return {
    refundId: item.refundId,
    type: 'refund',
    orderId: item.orderId,
    orderItemId: item.orderItemId,
    storeId: item.storeId,
    storePhone: detail?.merchantPhone ?? null,
    storeName: item.storeName,
    productId: `${item.orderId}-${item.orderItemId}`,
    productName: item.productName,
    productImageUrl: item.productImageUrl,
    skuDescription: item.skuDescription,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    applyQuantity: item.quantity,
    refundAmount: item.refundAmount,
    appliedAt: item.appliedAt,
    reason: detail?.reason ?? '退款申请',
    description: detail?.description ?? null,
    status: item.status,
    statusText: item.statusText,
    paymentMethod: detail?.amountDetail.paymentMethod ?? '账户余额',
  }
}

function createSeedReturnRecord(item: typeof mockTradeData.afterSaleListPageData.returnPage.list[number]): AfterSaleRecord {
  const detail = mockTradeData.returnDetailPageDataById[item.refundId] ?? null

  return {
    refundId: item.refundId,
    type: 'return',
    orderId: item.orderId,
    orderItemId: item.orderItemId,
    storeId: item.storeId,
    storePhone: detail?.merchantPhone ?? null,
    storeName: item.storeName,
    productId: `${item.orderId}-${item.orderItemId}`,
    productName: item.productName,
    productImageUrl: item.productImageUrl,
    skuDescription: item.skuDescription,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    applyQuantity: item.returnQuantity,
    refundAmount: item.refundAmount,
    appliedAt: item.appliedAt,
    reason: detail?.reason ?? '退货申请',
    description: detail?.description ?? null,
    status: item.status,
    statusText: item.statusText,
    paymentMethod: detail?.amountDetail.paymentMethod ?? '账户余额',
  }
}

function getMockSeedAfterSaleRecords() {
  return [
    ...mockTradeData.afterSaleListPageData.refundPage.list.map((item) => createSeedRefundRecord(item)),
    ...mockTradeData.afterSaleListPageData.returnPage.list.map((item) => createSeedReturnRecord(item)),
  ]
}

function createMockSeedAfterSaleRecordByRefundId(refundId: string) {
  return getMockSeedAfterSaleRecords().find((item) => item.refundId === refundId) ?? null
}

function resolveAfterSaleRepository(type: BackendType, memberAuthSession: MemberAuthSession) {
  switch (type) {
    case 'backend-a':
      return createBrowserAfterSaleRepository({
        getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
        namespace: 'backend-a',
      })
    case 'mock':
    default:
      return createBrowserAfterSaleRepository({
        getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
        getSeedRecordByRefundId: createMockSeedAfterSaleRecordByRefundId,
        namespace: 'mock',
        resolveStorePhone: (storeId) => getMockStore(storeId)?.phone ?? null,
      })
  }
}

function mergeSavedReturnShipment<T extends {
  refundId: string
  status: string
  statusText: string
  returnShipment?: {
    company: string
    shippedAt: string | null
    trackingNo: string
  } | null
  merchantProcess?: {
    remark: string | null
    status: string
  }
  platformProcess?: {
    remark: string | null
    status: string
  }
}>(item: T, snapshot: AfterSaleSnapshot): T {
  if (item.status === 'cancelled') {
    return item
  }

  const savedShipment = snapshot.returnShipments[item.refundId] ?? null

  if (!savedShipment) {
    return item
  }

  return {
    ...item,
    merchantProcess: item.merchantProcess
      ? {
          ...item.merchantProcess,
          remark: '买家已回寄商品，等待商家签收。',
          status: 'awaiting-receipt',
        }
      : item.merchantProcess,
    platformProcess: item.platformProcess
      ? {
          ...item.platformProcess,
          remark: '平台已记录回寄物流，等待商家处理。',
          status: 'processing',
        }
      : item.platformProcess,
    returnShipment: savedShipment,
    status: 'awaiting-receipt',
    statusText: '待商家收货',
  }
}

function createSavedRefundDetailActions(record: AfterSaleRecord) {
  if (record.status === 'cancelled') {
    return [{ enabled: true, key: 'view-detail' as const, reason: null }]
  }

  return [
    { enabled: true, key: 'view-detail' as const, reason: null },
    { enabled: true, key: 'cancel' as const, reason: null },
  ]
}

function createSavedReturnDetailActions(record: AfterSaleRecord, snapshot: AfterSaleSnapshot) {
  if (record.status === 'cancelled') {
    return [{ enabled: true, key: 'view-detail' as const, reason: null }]
  }

  if (snapshot.returnShipments[record.refundId]) {
    return [
      { enabled: true, key: 'view-detail' as const, reason: null },
      { enabled: true, key: 'delay' as const, reason: null },
      { enabled: true, key: 'ship-return' as const, reason: null },
    ]
  }

  return [
    { enabled: true, key: 'view-detail' as const, reason: null },
    { enabled: true, key: 'delay' as const, reason: null },
    { enabled: true, key: 'ship-return' as const, reason: null },
    { enabled: true, key: 'cancel' as const, reason: null },
  ]
}

function createSavedRefundRecord(record: AfterSaleRecord) {
  return {
    actions: [{ enabled: true, key: 'view-detail' as const, reason: null }],
    appliedAt: record.appliedAt,
    orderId: record.orderId,
    orderItemId: record.orderItemId,
    productImageUrl: record.productImageUrl,
    productName: record.productName,
    quantity: record.applyQuantity,
    refundAmount: record.refundAmount,
    refundId: record.refundId,
    skuDescription: record.skuDescription,
    status: record.status,
    statusText: record.statusText,
    storeId: record.storeId,
    storeName: record.storeName,
    unitPrice: record.unitPrice,
  }
}

function createSavedReturnRecord(record: AfterSaleRecord, snapshot: AfterSaleSnapshot) {
  return {
    ...createSavedRefundRecord(record),
    actions: createSavedReturnDetailActions(record, snapshot).filter((item) => item.key !== 'cancel'),
    quantity: record.quantity,
    returnQuantity: record.applyQuantity,
  }
}

function createSavedRefundDetail(
  record: AfterSaleRecord,
  seedDetail: typeof mockTradeData.refundDetailPageDataById[string] | null,
) {
  return {
    actions: createSavedRefundDetailActions(record),
    amountDetail: seedDetail?.amountDetail ?? {
      onlineRefundAmount: record.refundAmount,
      paymentMethod: record.paymentMethod,
      predepositRefundAmount: 0,
      rechargeCardRefundAmount: 0,
    },
    description: record.description ?? seedDetail?.description ?? null,
    evidenceImages: seedDetail?.evidenceImages ?? [],
    merchantPhone: record.storePhone ?? seedDetail?.merchantPhone ?? null,
    merchantProcess: record.status === 'cancelled'
      ? { remark: '买家已取消退款申请。', status: 'cancelled' }
      : (seedDetail?.merchantProcess ?? { remark: '商家处理中，请耐心等待。', status: 'processing' }),
    orderId: record.orderId,
    orderItemId: record.orderItemId,
    platformProcess: record.status === 'cancelled'
      ? { remark: '平台已关闭该退款申请。', status: 'closed' }
      : (seedDetail?.platformProcess ?? { remark: '平台已收到退款申请。', status: 'pending' }),
    reason: record.reason,
    refundAmount: record.refundAmount,
    refundId: record.refundId,
    status: record.status,
    statusText: record.statusText,
  }
}

function createSavedReturnDetail(
  record: AfterSaleRecord,
  snapshot: AfterSaleSnapshot,
  seedDetail: typeof mockTradeData.returnDetailPageDataById[string] | null,
) {
  return mergeSavedReturnShipment({
    actions: createSavedReturnDetailActions(record, snapshot),
    amountDetail: seedDetail?.amountDetail ?? {
      onlineRefundAmount: record.refundAmount,
      paymentMethod: record.paymentMethod,
      predepositRefundAmount: 0,
      rechargeCardRefundAmount: 0,
    },
    appliedAt: record.appliedAt,
    description: record.description ?? seedDetail?.description ?? null,
    merchantPhone: record.storePhone ?? seedDetail?.merchantPhone ?? null,
    merchantAddress: seedDetail?.merchantAddress ?? {
      address: '湖北省武汉市武昌区中北路 88 号售后中心',
      recipientName: '售后专员',
      recipientPhone: '027-88886666',
    },
    merchantProcess: record.status === 'cancelled'
      ? { remark: '买家已取消退货申请。', status: 'cancelled' }
      : (seedDetail?.merchantProcess ?? { remark: '商家已通过退货申请，请尽快寄回。', status: 'approved' }),
    orderId: record.orderId,
    orderItemId: record.orderItemId,
    platformProcess: record.status === 'cancelled'
      ? { remark: '平台已关闭该退货申请。', status: 'closed' }
      : (seedDetail?.platformProcess ?? { remark: '平台已记录退货申请。', status: 'processing' }),
    productImageUrl: record.productImageUrl,
    productName: record.productName,
    quantity: record.quantity,
    reason: record.reason,
    refundAmount: record.refundAmount,
    refundId: record.refundId,
    returnQuantity: record.applyQuantity,
    returnShipment: seedDetail?.returnShipment ?? null,
    skuDescription: record.skuDescription,
    status: record.status,
    statusText: record.statusText,
    unitPrice: record.unitPrice,
  }, snapshot)
}

function mergeAfterSaleRecords(seedRecords: AfterSaleRecord[], snapshot: AfterSaleSnapshot) {
  const recordsByRefundId = new Map(seedRecords.map((item) => [item.refundId, item]))

  snapshot.applications.forEach((item) => {
    recordsByRefundId.set(item.refundId, item)
  })

  return [...recordsByRefundId.values()]
}

function createAfterSaleStatusMap(seedRecords: AfterSaleRecord[], snapshot: AfterSaleSnapshot, orderId: string) {
  const records = mergeAfterSaleRecords(seedRecords, snapshot)
    .filter((item) => item.orderId === orderId)
    .sort((left, right) => (left.appliedAt < right.appliedAt ? 1 : -1))

  return records.reduce<Record<string, string | null>>((result, item) => {
    if (!(item.orderItemId in result)) {
      result[item.orderItemId] = item.statusText
    }

    return result
  }, {})
}

function mergeSavedAfterSaleApplicationsIntoList(
  data: ReturnType<typeof createEmptyAfterSaleListPageData>,
  snapshot: AfterSaleSnapshot,
) {
  const savedApplications = snapshot.applications
  const savedRefundRecords = savedApplications
    .filter((item) => item.type === 'refund')
    .map((item) => createSavedRefundRecord(item))
  const savedReturnRecords = savedApplications
    .filter((item) => item.type === 'return')
    .map((item) => mergeSavedReturnShipment(createSavedReturnRecord(item, snapshot), snapshot))
  const refundList = [
    ...savedRefundRecords,
    ...data.refundPage.list.filter((item) => !savedRefundRecords.some((saved) => saved.refundId === item.refundId)),
  ]
  const returnList = [
    ...savedReturnRecords,
    ...data.returnPage.list
      .filter((item) => !savedReturnRecords.some((saved) => saved.refundId === item.refundId))
      .map((item) => mergeSavedReturnShipment(item, snapshot)),
  ]

  return {
    ...data,
    refundPage: {
      ...data.refundPage,
      list: refundList,
      total: refundList.length,
    },
    returnPage: {
      ...data.returnPage,
      list: returnList,
      total: returnList.length,
    },
  }
}

function resolveTradeQuery(
  type: BackendType,
  afterSaleRepository: AfterSaleRepository,
  cartRepository: CartRepository,
  memberAuthSession: MemberAuthSession,
) {
  const seedAfterSaleListPageData = type === 'mock' ? mockTradeData.afterSaleListPageData : createEmptyAfterSaleListPageData()
  const seedAfterSaleRecords = type === 'mock' ? getMockSeedAfterSaleRecords() : []
  const seedOrderDetailPageDataById = type === 'mock' ? mockTradeData.orderDetailPageDataById : {}
  const seedRefundDetailPageDataById = type === 'mock' ? mockTradeData.refundDetailPageDataById : {}
  const seedReturnDetailPageDataById = type === 'mock' ? mockTradeData.returnDetailPageDataById : {}

  switch (type) {
    case 'backend-a':
    case 'mock':
    default:
      return createTradeQuery({
        cartRepository,
        getAfterSaleListPageData: async () => {
          const snapshot = await afterSaleRepository.getSnapshot()
          return mergeSavedAfterSaleApplicationsIntoList(seedAfterSaleListPageData, snapshot)
        },
        getOrderDetailPageData: createBrowserOrderDetailPageDataReader({
          defaultStoreId: type === 'mock' ? 'store-mock' : 'backend-a-store',
          getAfterSaleStatusMap: async (orderId) => {
            const snapshot = await afterSaleRepository.getSnapshot()
            return createAfterSaleStatusMap(seedAfterSaleRecords, snapshot, orderId)
          },
          getSeedDetailPageData: (orderId) => seedOrderDetailPageDataById[orderId] ?? null,
          readOrders: () => readBrowserOrderRecords(
            type,
            memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
            type === 'mock' ? getMockOrderSeedRecords : getBackendAOrderSeedRecords,
          ),
        }),
        getOrderListPageData: createBrowserOrderListPageDataReader({
          readOrders: () => readBrowserOrderRecords(
            type,
            memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
            type === 'mock' ? getMockOrderSeedRecords : getBackendAOrderSeedRecords,
          ),
        }),
        getRefundDetailPageData: async (refundId) => {
          const snapshot = await afterSaleRepository.getSnapshot()
          const savedRecord = snapshot.applications.find((item) => item.refundId === refundId) ?? null
          const seedDetail = seedRefundDetailPageDataById[refundId] ?? null

          if (savedRecord?.type === 'refund') {
            return createSavedRefundDetail(savedRecord, seedDetail)
          }

          return seedDetail
        },
        getReturnDetailPageData: async (refundId) => {
          const snapshot = await afterSaleRepository.getSnapshot()
          const savedRecord = snapshot.applications.find((item) => item.refundId === refundId) ?? null
          const seedDetail = seedReturnDetailPageDataById[refundId] ?? null

          if (savedRecord?.type === 'return') {
            return createSavedReturnDetail(savedRecord, snapshot, seedDetail)
          }

          return seedDetail ? mergeSavedReturnShipment(seedDetail, snapshot) : null
        },
        mapCartPageData: type === 'mock' ? mapMockCartPageData : mapBackendACartPageData,
      })
  }
}

function resolveMemberCenterQuery(
  type: BackendType,
  memberAuthSession: MemberAuthSession,
  memberAssetsService: MemberAssetsService,
) {
  switch (type) {
    case 'backend-a':
      return createBackendAMemberCenterQuery(memberAuthSession, memberAssetsService)
    case 'mock':
    default:
      return createMockMemberCenterQuery(memberAuthSession, memberAssetsService)
  }
}

export function createBackendRuntime(type = backendTarget): BackendRuntime {
  const supportedModules = supportedModulesByBackend[type]
  const enabledModules = resolveRuntimeEnabledModules(type)
  const memberAuthSession = createBrowserMemberAuthSession()
  const memberProfileService = resolveMemberProfileService(type, memberAuthSession)
  const memberSecurityService = resolveMemberSecurityService(type, memberAuthSession)
  const memberAssetsService = resolveMemberAssetsService(type, memberAuthSession)
  const afterSaleRepository = resolveAfterSaleRepository(type, memberAuthSession)
  const cartRepository = resolveCartRepository(memberAuthSession)
  const memberAddressRepository = resolveMemberAddressRepository(memberAuthSession)
  const memberFavoriteRepository = createBrowserMemberFavoriteRepository()
  const repositories = {
    afterSale: afterSaleRepository,
    cart: cartRepository,
    memberAddress: memberAddressRepository,
    memberFavorite: memberFavoriteRepository,
    order: resolveOrderRepository(type, memberAuthSession),
    product: resolveProductRepository(type),
  }

  return {
    auth: {
      profileService: memberProfileService,
      repository: resolveMemberAuthRepository(type),
      securityService: memberSecurityService,
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
      memberCenter: resolveMemberCenterQuery(type, memberAuthSession, memberAssetsService),
      storefront: resolveStorefrontQuery(type),
      trade: resolveTradeQuery(type, afterSaleRepository, cartRepository, memberAuthSession),
    },
    services: {
      memberAssets: memberAssetsService,
    },
    repositories,
    supportedModules,
    type,
  }
}
