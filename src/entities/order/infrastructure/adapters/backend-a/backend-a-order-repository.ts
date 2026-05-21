import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import type { MemberAuthSession } from '@/entities/member-auth'

import type {
  OrderRefundRequestResult,
  CheckoutCouponUsage,
  CheckoutVirtualAccountInput,
  CheckoutPreview,
  OrderConfirmation,
  OrderRecord,
} from '../../../domain/order'
import type { OrderRepository } from '../../../domain/order-repository'
import type {
  BackendACheckoutPreviewDto,
  BackendAOrderDto,
  BackendAOrderRefundRequestPayloadDto,
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

function normalizeRefundReason(reason: string) {
  const normalizedReason = reason.trim()

  if (normalizedReason.length < 2) {
    throw new Error('请填写退款原因')
  }

  if (normalizedReason.length > 1000) {
    throw new Error('退款原因不能超过 1000 个字')
  }

  return normalizedReason
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

function normalizeVirtualAccountInputs(
  lineIds: string[],
  virtualAccountInputs: CheckoutVirtualAccountInput[] | null | undefined,
) {
  const allowedLineIds = new Set(lineIds)

  return (virtualAccountInputs ?? [])
    .map((input) => {
      const normalizedLineId = input.lineId.trim()
      const normalizedValue = input.value.trim()

      return {
        cart_item_id: parseInteger(normalizedLineId),
        value: normalizedValue,
      }
    })
    .filter((input) =>
      input.cart_item_id !== null
      && allowedLineIds.has(String(input.cart_item_id))
      && input.value.length > 0,
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

function mapRefundRequestResult(
  orderId: string,
  payload: BackendAOrderRefundRequestPayloadDto,
): OrderRefundRequestResult {
  const statusText = payload.status_text?.trim()
  const normalizedStatusText = !statusText
    ? '退款中'
    : (
        statusText.includes('完成')
          || statusText.includes('成功')
          || statusText.includes('已退款')
          ? '已完成'
          : '退款中'
      )

  return {
    orderId,
    reason: payload.reason,
    status: payload.status === 2 ? 'pending-shipment' : 'refunding',
    statusText: normalizedStatusText,
    updatedAt: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
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
    lineIds: string[],
    addressId?: string | null,
    couponUsages?: CheckoutCouponUsage[],
    virtualAccountInputs?: CheckoutVirtualAccountInput[],
  ) {
    return httpClient.post<BackendACheckoutPreviewDto>('/api/v1/checkout/preview', {
      ...(addressId ? { address_id: normalizeAddressId(addressId) } : {}),
      cart_item_ids: normalizeCartLineIds(lineIds),
      ...(couponUsages && couponUsages.length > 0
        ? { coupon_usages: normalizeCouponUsages(couponUsages) }
        : {}),
      ...(virtualAccountInputs && virtualAccountInputs.length > 0
        ? { virtual_account_inputs: normalizeVirtualAccountInputs(lineIds, virtualAccountInputs) }
        : {}),
    })
  }

  return {
    async createPreview(command, couponUsages) {
      const lineIds = command.lines.map((line) => line.lineId ?? '')
      const preview = await requestCheckoutPreview(
        lineIds,
        command.addressId,
        couponUsages,
        command.virtualAccountInputs,
      )
      return mapBackendACheckoutPreviewDto(command, preview)
    },

    async requestRefund(command) {
      const orderId = normalizeOrderId(command.orderId)
      const response = await httpClient.post<BackendAOrderRefundRequestPayloadDto>(
        `/api/v1/orders/${orderId}/refund-request`,
        {
          reason: normalizeRefundReason(command.reason),
        },
      )

      return mapRefundRequestResult(String(orderId), response)
    },

    async submit(command) {
      const lineIds = command.lines.map((line) => line.lineId ?? '')

      const orders = await httpClient.post<BackendAOrderDto[]>('/api/v1/checkout/submit', {
        ...(command.addressId ? { address_id: normalizeAddressId(command.addressId) } : {}),
        cart_item_ids: normalizeCartLineIds(lineIds),
        ...(command.couponUsages && command.couponUsages.length > 0
          ? { coupon_usages: normalizeCouponUsages(command.couponUsages) }
          : {}),
        remark: command.remark ?? undefined,
        ...(command.virtualAccountInputs && command.virtualAccountInputs.length > 0
          ? { virtual_account_inputs: normalizeVirtualAccountInputs(lineIds, command.virtualAccountInputs) }
          : {}),
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
