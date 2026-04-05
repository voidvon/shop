import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'
import type { MemberAuthSession } from '@/entities/member-auth'

import type {
  CheckoutAvailableCoupon,
  CheckoutCouponUsage,
  CheckoutPreview,
  CheckoutPreviewGroup,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function parseString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function pickRecord(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (isRecord(value)) {
      return value
    }
  }

  return null
}

function pickNumber(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = parseNumber(source[key])

      if (value !== null) {
        return value
      }
    }
  }

  return null
}

function pickInteger(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = parseInteger(source[key])

      if (value !== null) {
        return value
      }
    }
  }

  return null
}

function pickString(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = parseString(source[key])

      if (value) {
        return value
      }
    }
  }

  return null
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

interface BackendAUserCouponDto {
  [key: string]: unknown
}

interface BackendAUserCouponItem {
  discountAmount: number
  discountRate: number | null
  endsAt: string | null
  merchantId: number | null
  minimumAmount: number
  name: string
  startsAt: string | null
  type: string | null
  usedAt: string | null
  userCouponId: number
}

function normalizeUserCouponItems(
  response: BackendAUserCouponDto[] | { data?: BackendAUserCouponDto[] | { data?: BackendAUserCouponDto[] } },
) {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response.data)) {
    return response.data
  }

  if (isRecord(response.data) && Array.isArray(response.data.data)) {
    return response.data.data
  }

  return []
}

function mapUserCouponItem(item: BackendAUserCouponDto): BackendAUserCouponItem | null {
  const rootSource = isRecord(item) ? item : null

  if (!rootSource) {
    return null
  }

  const templateSource = pickRecord(rootSource, [
    'template',
    'coupon_template',
    'couponTemplate',
    'merchant_coupon',
    'merchantCoupon',
    'coupon',
  ])
  const merchantSource = pickRecord(rootSource, ['merchant']) ?? pickRecord(templateSource ?? {}, ['merchant'])
  const sources = [rootSource, templateSource, merchantSource]
  const userCouponId = pickInteger([rootSource], ['user_coupon_id', 'userCouponId', 'id'])

  if (!userCouponId) {
    return null
  }

  return {
    discountAmount: pickNumber(sources, ['discount_amount', 'discountAmount']) ?? 0,
    discountRate: pickNumber(sources, ['discount_rate', 'discountRate']),
    endsAt: pickString(sources, ['ends_at', 'endsAt', 'expired_at', 'expiredAt']),
    merchantId:
      pickInteger([rootSource, templateSource], ['merchant_id', 'merchantId'])
      ?? pickInteger([merchantSource], ['merchant_id', 'merchantId', 'id']),
    minimumAmount: pickNumber(sources, ['minimum_amount', 'minimumAmount']) ?? 0,
    name: pickString(sources, ['name', 'coupon_name', 'couponName']) ?? `优惠券${userCouponId}`,
    startsAt: pickString(sources, ['starts_at', 'startsAt']),
    type: pickString(sources, ['type']),
    usedAt: pickString(sources, ['used_at', 'usedAt']),
    userCouponId,
  }
}

function isCouponCurrentlyAvailable(coupon: BackendAUserCouponItem, now: Date) {
  if (coupon.usedAt) {
    return false
  }

  const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null
  if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt.getTime() > now.getTime()) {
    return false
  }

  const endsAt = coupon.endsAt ? new Date(coupon.endsAt) : null
  if (endsAt && !Number.isNaN(endsAt.getTime()) && endsAt.getTime() < now.getTime()) {
    return false
  }

  return true
}

function estimateCouponDiscount(totalAmount: number, coupon: BackendAUserCouponItem) {
  if (coupon.type === 'discount' && coupon.discountRate && coupon.discountRate > 0) {
    const normalizedRate = Math.min(coupon.discountRate, 10) / 10
    return Math.max(totalAmount * (1 - normalizedRate), 0)
  }

  return Math.max(coupon.discountAmount, 0)
}

function resolveAvailableCouponsForGroup(
  group: CheckoutPreviewGroup,
  coupons: BackendAUserCouponItem[],
) {
  const now = new Date()
  return coupons
    .filter((coupon) => isCouponCurrentlyAvailable(coupon, now))
    .filter((coupon) =>
      coupon.merchantId === group.merchantId
      && group.totalAmount >= coupon.minimumAmount,
    )
    .sort((left, right) => estimateCouponDiscount(group.totalAmount, right) - estimateCouponDiscount(group.totalAmount, left))
    .map((coupon): CheckoutAvailableCoupon => ({
      discountAmount: coupon.discountAmount,
      discountRate: coupon.discountRate,
      endsAt: coupon.endsAt,
      merchantId: coupon.merchantId,
      minimumAmount: coupon.minimumAmount,
      name: coupon.name,
      startsAt: coupon.startsAt,
      type: coupon.type,
      userCouponId: coupon.userCouponId,
    }))
}

function attachAvailableCoupons(
  preview: CheckoutPreview,
  coupons: BackendAUserCouponItem[],
): CheckoutPreview {
  return {
    ...preview,
    groups: preview.groups.map((group) => ({
      ...group,
      availableCoupons: resolveAvailableCouponsForGroup(group, coupons),
    })),
  }
}

async function requestUserCoupons(
  httpClient: ReturnType<typeof createBackendAOrderHttpClient>,
) {
  const response = await httpClient.get<BackendAUserCouponDto[] | { data?: BackendAUserCouponDto[] | { data?: BackendAUserCouponDto[] } }>(
    '/api/v1/coupons',
    {
      per_page: 100,
    },
  )

  return normalizeUserCouponItems(response)
    .map(mapUserCouponItem)
    .filter((item): item is BackendAUserCouponItem => item !== null)
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
      let userCoupons: BackendAUserCouponItem[] = []

      try {
        userCoupons = await requestUserCoupons(httpClient)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[checkout] coupon list resolution failed', error)
        }
      }

      return attachAvailableCoupons(
        mapBackendACheckoutPreviewDto(command, preview),
        userCoupons,
      )
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

    async transitionStatus() {
      throw createUnsupportedOrderActionError()
    },
  }
}
