import type { MemberAuthSession } from '@/entities/member-auth'
import {
  BackendAHttpError,
  createBackendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'
import { mapBackendAOrderDto } from '@/entities/order/infrastructure/mappers/backend-a-order-mapper'
import type {
  BackendAOrderCollectionDto,
  BackendAOrderDto,
} from '@/entities/order/infrastructure/dto/backend-a-order.dto'
import { allowActions } from '@/shared/mocks/modules'
import type {
  OrderDetailPageData,
  TradeOrderAction,
  TradeOrderStatus,
} from '@/shared/types/modules'

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
    address: {
      address: '后端暂未返回收货地址',
      recipientName: '待同步',
      recipientPhone: '暂无',
    },
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

  return async function getOrderListPageData(): Promise<OrderListPageData> {
    const response = await httpClient.get<BackendAOrderCollectionDto>('/api/v1/orders', {
      per_page: 100,
    })

    return {
      keyword: '',
      orders: response.data.map(mapOrderListEntry),
    }
  }
}

export function createBackendAOrderDetailPageDataReader(memberAuthSession: MemberAuthSession) {
  const httpClient = createBackendATradeHttpClient(memberAuthSession)

  return async function getOrderDetailPageData(orderId: string): Promise<OrderDetailPageData | null> {
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
