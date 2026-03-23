import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import type { MemberAuthSession } from '@/entities/member-auth'

import type {
  OrderConfirmation,
  OrderRecord,
} from '../../../domain/order'
import type { OrderRepository } from '../../../domain/order-repository'
import type {
  BackendACheckoutPreviewDto,
  BackendAOrderDto,
} from '../../dto/backend-a-order.dto'
import {
  mapBackendACheckoutPreviewDto,
} from '../../mappers/backend-a-order-mapper'

function createBackendAOrderHttpClient(memberAuthSession: MemberAuthSession) {
  return createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })
}

function normalizeCartLineIds(lineIds: string[]) {
  const normalizedLineIds = lineIds
    .map((lineId) => Number.parseInt(lineId, 10))
    .filter((lineId) => Number.isFinite(lineId) && lineId > 0)

  if (normalizedLineIds.length === 0) {
    throw new Error('缺少可提交的购物车商品')
  }

  return normalizedLineIds
}

function normalizeAddressId(addressId: string) {
  const normalizedAddressId = Number.parseInt(addressId, 10)

  if (!Number.isFinite(normalizedAddressId) || normalizedAddressId <= 0) {
    throw new Error('收货地址标识无效')
  }

  return normalizedAddressId
}

function createUnsupportedOrderActionError() {
  return new Error('当前后端文档未提供订单取消、支付或确认收货接口')
}

function mapOrderConfirmation(
  command: Parameters<OrderRepository['submit']>[0],
  orders: BackendAOrderDto[],
): OrderConfirmation {
  const firstOrder = orders[0]

  if (!firstOrder) {
    throw new Error('后端未返回已提交订单')
  }

  return {
    orderId: String(firstOrder.id),
    payableAmount: orders.reduce((sum, order) => sum + Number.parseFloat(order.payable_amount || '0'), 0),
    paymentMethod: '账户余额',
    source: command.source,
    submittedAt: firstOrder.paid_at ?? new Date().toISOString(),
  }
}

export function getBackendAOrderSeedRecords(): OrderRecord[] {
  return []
}

export function createBackendAOrderRepository(
  memberAuthSession: MemberAuthSession,
): OrderRepository {
  const httpClient = createBackendAOrderHttpClient(memberAuthSession)

  return {
    async createPreview(command) {
      if (command.source !== 'cart') {
        throw new Error('当前后端仅支持从购物车发起结算')
      }

      const preview = await httpClient.post<BackendACheckoutPreviewDto>('/api/v1/checkout/preview', {
        cart_item_ids: normalizeCartLineIds(command.lines.map((line) => line.lineId ?? '')),
      })

      return mapBackendACheckoutPreviewDto(command, preview)
    },

    async submit(command) {
      if (command.source !== 'cart') {
        throw new Error('当前后端仅支持从购物车发起下单')
      }

      if (!command.addressId) {
        throw new Error('缺少收货地址')
      }

      const orders = await httpClient.post<BackendAOrderDto[]>('/api/v1/checkout/submit', {
        address_id: normalizeAddressId(command.addressId),
        cart_item_ids: normalizeCartLineIds(command.lines.map((line) => line.lineId ?? '')),
        remark: command.remark ?? undefined,
      })

      return mapOrderConfirmation(command, orders)
    },

    async transitionStatus() {
      throw createUnsupportedOrderActionError()
    },
  }
}
