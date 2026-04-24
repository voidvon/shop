import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import type { MemberAuthSession } from '@/entities/member-auth'

import type {
  CheckoutCouponUsage,
  CheckoutPreview,
  OrderConfirmation,
  OrderRecord,
} from '../../../domain/order'
import type { OrderRepository } from '../../../domain/order-repository'
import type {
  BackendACheckoutPreviewDto,
  BackendAOrderDto,
} from '../../dto/backend-a-order.dto'
import {
  mapBackendAOrderDto,
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

function normalizeOrderId(orderId: string) {
  const normalizedOrderId = Number.parseInt(orderId, 10)

  if (!Number.isFinite(normalizedOrderId) || normalizedOrderId <= 0) {
    throw new Error('订单标识无效')
  }

  return normalizedOrderId
}

function createUnsupportedOrderActionError() {
  return new Error('当前后端文档未提供订单取消或支付接口')
}

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number.parseFloat(value)

    if (Number.isFinite(parsedValue)) {
      return parsedValue
    }
  }

  return null
}

function parseInteger(value: unknown) {
  const parsedValue = parseNumber(value)

  if (parsedValue === null) {
    return null
  }

  const normalizedValue = Math.trunc(parsedValue)
  return normalizedValue > 0 ? normalizedValue : null
}

function normalizeCouponUsages(couponUsages: CheckoutCouponUsage[] | null | undefined) {
  return (couponUsages ?? [])
    .map((couponUsage) => ({
      balance_type_id: parseInteger(couponUsage.balanceTypeId),
      merchant_id: parseInteger(couponUsage.merchantId),
      user_coupon_id: parseInteger(couponUsage.userCouponId),
    }))
    .filter((couponUsage) =>
      couponUsage.balance_type_id !== null
      && couponUsage.merchant_id !== null
      && couponUsage.user_coupon_id !== null,
    )
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

function mapTransitionStatusResult(
  action: Parameters<OrderRepository['transitionStatus']>[0]['action'],
  dto: BackendAOrderDto,
) {
  const record = mapBackendAOrderDto(dto)

  return {
    action,
    orderId: String(dto.id),
    status: record.status,
    statusText: record.statusText,
    updatedAt: dto.updated_at ?? dto.shipped_at ?? dto.paid_at ?? dto.created_at ?? new Date().toISOString(),
  }
}

export function getBackendAOrderSeedRecords(): OrderRecord[] {
  return []
}

export function createBackendAOrderRepository(
  memberAuthSession: MemberAuthSession,
): OrderRepository {
  const httpClient = createBackendAOrderHttpClient(memberAuthSession)

  async function requestCheckoutPreview(
    cartItemIds?: number[],
    couponUsages?: CheckoutCouponUsage[],
  ) {
    return httpClient.post<BackendACheckoutPreviewDto>('/api/v1/checkout/preview', {
      ...(cartItemIds && cartItemIds.length > 0 ? { cart_item_ids: cartItemIds } : {}),
      ...(couponUsages && couponUsages.length > 0
        ? { coupon_usages: normalizeCouponUsages(couponUsages) }
        : {}),
    })
  }

  return {
    async createPreview(command, couponUsages) {
      if (command.source !== 'cart') {
        throw new Error('当前后端仅支持从购物车发起结算')
      }

      const preview = await requestCheckoutPreview(undefined, couponUsages)
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
        ...(command.couponUsages && command.couponUsages.length > 0
          ? { coupon_usages: normalizeCouponUsages(command.couponUsages) }
          : {}),
        remark: command.remark ?? undefined,
      })

      return mapOrderConfirmation(command, orders)
    },

    async transitionStatus(command) {
      if (command.action !== 'confirm-receipt') {
        throw createUnsupportedOrderActionError()
      }

      const order = await httpClient.post<BackendAOrderDto>(
        `/api/v1/orders/${normalizeOrderId(command.orderId)}/receive`,
      )

      return mapTransitionStatusResult(command.action, order)
    },
  }
}
