import type { MemberAuthSession } from '@/entities/member-auth'
import { readBrowserOrderRecords } from '@/entities/order/infrastructure/browser-order-storage'
import {
  BackendAHttpError,
  createBackendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'
import { mapBackendAOrderDto } from '@/entities/order/infrastructure/mappers/backend-a-order-mapper'
import type {
  BackendAOrderAddressDto,
  BackendAOrderCollectionDto,
  BackendAOrderDto,
} from '@/entities/order/infrastructure/dto/backend-a-order.dto'
import { allowActions } from '@/shared/mocks/modules'
import type {
  OrderDetailPageData,
  TradeOrderAction,
  TradeOrderStatus,
} from '@/shared/types/modules'
import { createBrowserOrderDetailPageDataReader } from '../../create-browser-order-detail-page-data-reader'
import { createBrowserOrderListPageDataReader } from '../../create-browser-order-list-page-data-reader'
import { simulatedInstantOrderNamespace } from '@/processes/checkout-flow/model/instant-checkout-draft'

import type { OrderListEntry, OrderListPageData } from '../../../domain/trade-page-data'

function createBackendATradeHttpClient(memberAuthSession: MemberAuthSession) {
  return createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })
}

function resolveOrderStatusHint(status: TradeOrderStatus) {
  switch (status) {
    case 'pending-payment':
      return '订单已创建，等待支付。'
    case 'pending-shipment':
      return '订单已支付，商家正在备货。'
    case 'pending-receipt':
      return '商品已发出，请留意物流动态。'
    case 'completed':
      return '订单已完成。'
    case 'cancelled':
      return '订单已取消。'
    default:
      return '订单处理中。'
  }
}

function resolveOrderActions(status: TradeOrderStatus) {
  switch (status) {
    case 'pending-receipt':
      return allowActions<TradeOrderAction>(['view-logistics', 'copy-order-no'])
    default:
      return allowActions<TradeOrderAction>(['copy-order-no'])
  }
}

function createAmountDetails(goodsAmount: number, discountAmount: number) {
  return [
    {
      amount: goodsAmount,
      code: 'goods',
      direction: 'increase' as const,
      label: '商品金额',
    },
    ...(discountAmount > 0
      ? [
          {
            amount: discountAmount,
            code: 'coupon',
            direction: 'decrease' as const,
            label: '优惠减免',
          },
        ]
      : []),
    {
      amount: 0,
      code: 'shipping',
      direction: 'increase' as const,
      label: '运费',
    },
  ]
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildAddressText(source: {
  address?: unknown
  city?: unknown
  district?: unknown
  full_address?: unknown
  province?: unknown
  street?: unknown
}) {
  const directAddress = normalizeText(source.address)
  if (directAddress) {
    return directAddress
  }

  const fullAddress = normalizeText(source.full_address)
  if (fullAddress) {
    return fullAddress
  }

  return [
    normalizeText(source.province),
    normalizeText(source.city),
    normalizeText(source.district),
    normalizeText(source.street),
  ].filter(Boolean).join('')
}

function normalizeAddressObject(value: unknown): BackendAOrderAddressDto | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as BackendAOrderAddressDto
}

function resolveOrderAddress(dto: BackendAOrderDto) {
  const candidateObjects = [
    normalizeAddressObject(dto.user_address),
    normalizeAddressObject(dto.address_info),
    normalizeAddressObject(dto.address),
  ].filter((item): item is BackendAOrderAddressDto => Boolean(item))

  for (const candidate of candidateObjects) {
    const address = buildAddressText(candidate)
    const recipientName = normalizeText(
      candidate.recipient_name ?? candidate.receiver_name ?? candidate.consignee_name,
    )
    const recipientPhone = normalizeText(
      candidate.recipient_phone ?? candidate.receiver_phone ?? candidate.mobile ?? candidate.phone,
    )

    if (address || recipientName || recipientPhone) {
      return {
        address: address || '地址信息待补充',
        recipientName: recipientName || '收货人',
        recipientPhone: recipientPhone || '暂无',
      }
    }
  }

  const topLevelAddress = buildAddressText(dto)
  const topLevelRecipientName = normalizeText(dto.consignee_name)
  const topLevelRecipientPhone = normalizeText(dto.mobile ?? dto.phone)

  if (topLevelAddress || topLevelRecipientName || topLevelRecipientPhone) {
    return {
      address: topLevelAddress || '地址信息待补充',
      recipientName: topLevelRecipientName || '收货人',
      recipientPhone: topLevelRecipientPhone || '暂无',
    }
  }

  return {
    address: '后端暂未返回收货地址',
    recipientName: '待同步',
    recipientPhone: '暂无',
  }
}

function mapOrderListEntry(dto: BackendAOrderDto): OrderListEntry {
  const record = mapBackendAOrderDto(dto)

  return {
    itemCount: record.itemCount,
    items: record.items,
    orderId: record.orderId,
    orderNo: record.orderNo,
    shippingAmount: record.shippingAmount,
    status: record.status === 'all' ? 'pending-payment' : record.status,
    statusText: record.statusText,
    storeName: record.storeName,
    totalAmount: record.totalAmount,
  }
}

function mapOrderDetail(dto: BackendAOrderDto): OrderDetailPageData {
  const record = mapBackendAOrderDto(dto)
  const discountAmount = Math.max(
    Number.parseFloat(dto.total_amount) - Number.parseFloat(dto.payable_amount),
    0,
  )
  const timelineBase = dto.paid_at ?? new Date().toISOString()

  return {
    actions: resolveOrderActions(record.status),
    address: resolveOrderAddress(dto),
    amountDetails: createAmountDetails(Number.parseFloat(dto.total_amount) || record.totalAmount, discountAmount),
    buyerMessage: dto.remark,
    deliveryRemark: null,
    gifts: [],
    invoiceInfo: null,
    items: dto.items.map((item) => ({
      actions: [],
      afterSaleStatus: null,
      orderItemId: String(item.id),
      productId: String(item.product_id),
      productImageUrl: record.items.find((entry) => entry.orderItemId === String(item.id))?.productImageUrl ?? '',
      productName: item.product_title,
      quantity: item.quantity,
      skuDescription: item.sku_name?.trim() || null,
      skuId: String(item.product_sku_id),
      storeId: String(dto.merchant?.id ?? dto.merchant_id),
      subtotalAmount: Number.parseFloat(item.total_amount) || 0,
      unitPrice: Number.parseFloat(item.price) || 0,
    })),
    logistics: record.status === 'pending-receipt'
      ? {
          description: '后端暂未提供物流轨迹详情。',
          title: '物流信息待补充',
          updatedAt: timelineBase,
        }
      : null,
    orderId: record.orderId,
    orderNo: record.orderNo,
    orderType: 'physical',
    payableAmount: record.totalAmount,
    paymentMethod: record.paymentMethod,
    promotions: [],
    shippingAmount: 0,
    status: record.status === 'all' ? 'pending-payment' : record.status,
    statusHint: resolveOrderStatusHint(record.status),
    statusText: record.statusText,
    storeId: String(dto.merchant?.id ?? dto.merchant_id),
    storeName: record.storeName,
    timeline: {
      completedAt: record.status === 'completed' ? timelineBase : null,
      createdAt: timelineBase,
      paidAt: dto.payment_status === 1 ? timelineBase : null,
      shippedAt: dto.delivery_status > 0 ? timelineBase : null,
    },
  }
}

export function createBackendAOrderListPageDataReader(memberAuthSession: MemberAuthSession) {
  const httpClient = createBackendATradeHttpClient(memberAuthSession)
  const localOrderListReader = createBrowserOrderListPageDataReader({
    readOrders: () => readBrowserOrderRecords(
      simulatedInstantOrderNamespace,
      memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
      () => [],
    ),
  })

  return async function getOrderListPageData(): Promise<OrderListPageData> {
    const response = await httpClient.get<BackendAOrderCollectionDto>('/api/v1/orders', {
      per_page: 100,
    })
    const localOrders = localOrderListReader().orders
    const localOrderIds = new Set(localOrders.map((order) => order.orderId))

    return {
      keyword: '',
      orders: [
        ...localOrders,
        ...response.data
          .map(mapOrderListEntry)
          .filter((order) => !localOrderIds.has(order.orderId)),
      ],
    }
  }
}

export function createBackendAOrderDetailPageDataReader(memberAuthSession: MemberAuthSession) {
  const httpClient = createBackendATradeHttpClient(memberAuthSession)
  const localOrderDetailReader = createBrowserOrderDetailPageDataReader({
    defaultStoreId: 'backend-a-store',
    readOrders: () => readBrowserOrderRecords(
      simulatedInstantOrderNamespace,
      memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
      () => [],
    ),
  })

  return async function getOrderDetailPageData(orderId: string): Promise<OrderDetailPageData | null> {
    const localDetail = await localOrderDetailReader(orderId)

    if (localDetail) {
      return localDetail
    }

    let order: BackendAOrderDto

    try {
      order = await httpClient.get<BackendAOrderDto>(
        `/api/v1/orders/${encodeURIComponent(orderId)}`,
      )
    } catch (error) {
      if (error instanceof BackendAHttpError && error.status === 404) {
        return null
      }

      throw error
    }

    return mapOrderDetail(order)
  }
}
