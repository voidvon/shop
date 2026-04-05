import type { MemberAuthSession } from '@/entities/member-auth'
import { backendAProductRepository } from '@/entities/product'
import { resolveBackendAMediaUrl } from '@/shared/api/backend-a/backend-a-config'
import {
  backendAHttpClient,
  createBackendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'
import { createBackendAOrderListPageDataReader } from '@/processes/trade/infrastructure/adapters/backend-a/backend-a-trade-readers'

import type { MemberAssetsService } from '../../../domain/member-assets-service'
import type { MemberCenterQuery } from '../../../domain/member-center-query'
import {
  mapBackendAMemberAboutPageData,
  mapBackendAMemberCardBindPageData,
  mapBackendAMemberCardsPageData,
  mapBackendAMemberCenterPageData,
  mapBackendAMemberCouponsPageData,
  mapBackendAMemberFavoritesPageData,
  mapBackendAMemberHistoryPageData,
  mapBackendAMemberPaymentCodePageData,
  mapBackendAMemberProfileNamePageData,
  mapBackendAMemberSettingsPageData,
  type BackendAPlatformSettingsDto,
} from '../../mappers/backend-a-member-center-mapper'
import type { MemberCouponListItem, MemberOrderSummary } from '../../../domain/member-center-page-data'

const emptyMemberOrderSummary: MemberOrderSummary = {
  pendingPaymentCount: 0,
  pendingReceiptCount: 0,
  pendingReviewCount: 0,
  pendingShipmentCount: 0,
  refundAndReturnCount: 0,
}

interface BackendAUserCouponDto {
  [key: string]: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function pickNumber(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]
      const parsedValue = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))

      if (Number.isFinite(parsedValue)) {
        return parsedValue
      }
    }
  }

  return null
}

function pickInteger(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  const value = pickNumber(sources, keys)

  if (value === null) {
    return null
  }

  return Number.isInteger(value) ? value : Math.trunc(value)
}

function pickString(sources: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const key of keys) {
      const value = source[key]

      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }

  return null
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

function mapUserCouponItem(item: BackendAUserCouponDto): MemberCouponListItem | null {
  const rootSource = isRecord(item) ? item : null

  if (!rootSource) {
    return null
  }

  const templateSource = isRecord(rootSource.template)
    ? rootSource.template
    : isRecord(rootSource.coupon_template)
      ? rootSource.coupon_template
      : isRecord(rootSource.couponTemplate)
        ? rootSource.couponTemplate
        : isRecord(rootSource.merchant_coupon)
          ? rootSource.merchant_coupon
          : isRecord(rootSource.merchantCoupon)
            ? rootSource.merchantCoupon
            : isRecord(rootSource.coupon)
              ? rootSource.coupon
              : null
  const merchantSource = isRecord(rootSource.merchant)
    ? rootSource.merchant
    : isRecord(templateSource?.merchant)
      ? templateSource.merchant
      : null
  const sources = [rootSource, templateSource, merchantSource]
  const userCouponId = pickInteger([rootSource], ['user_coupon_id', 'userCouponId', 'id'])

  if (!userCouponId) {
    return null
  }

  return {
    discountAmount: pickNumber(sources, ['discount_amount', 'discountAmount']) ?? 0,
    discountRate: pickNumber(sources, ['discount_rate', 'discountRate']),
    endsAt: pickString(sources, ['ends_at', 'endsAt', 'expired_at', 'expiredAt']),
    merchantName: pickString([merchantSource, templateSource, rootSource], ['short_name', 'shortName', 'name', 'merchant_name', 'merchantName']),
    minimumAmount: pickNumber(sources, ['minimum_amount', 'minimumAmount']) ?? 0,
    name: pickString(sources, ['name', 'coupon_name', 'couponName']) ?? `优惠券${userCouponId}`,
    startsAt: pickString(sources, ['starts_at', 'startsAt']),
    type: pickString(sources, ['type']),
    usedAt: pickString(sources, ['used_at', 'usedAt']),
    userCouponId,
  }
}

function isUsedCoupon(item: MemberCouponListItem) {
  return Boolean(item.usedAt)
}

function normalizeCandidateString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()
  return normalizedValue ? normalizedValue : null
}

function looksLikePaymentCodeUrl(value: string) {
  return (
    value.startsWith('data:image/')
    || /^https?:\/\//i.test(value)
    || value.startsWith('/')
    || value.startsWith('./')
    || value.startsWith('../')
  )
}

function findNestedString(
  input: unknown,
  predicate: (key: string, value: string) => boolean,
  depth = 0,
): string | null {
  if (depth > 4 || input === null || input === undefined) {
    return null
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const matchedValue = findNestedString(item, predicate, depth + 1)

      if (matchedValue) {
        return matchedValue
      }
    }

    return null
  }

  if (typeof input !== 'object') {
    return null
  }

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const value = normalizeCandidateString(rawValue)

    if (value && predicate(rawKey.toLowerCase(), value)) {
      return value
    }
  }

  for (const rawValue of Object.values(input)) {
    const matchedValue = findNestedString(rawValue, predicate, depth + 1)

    if (matchedValue) {
      return matchedValue
    }
  }

  return null
}

function normalizeBackendAPaymentCode(input: unknown) {
  const codeUrl = findNestedString(input, (key, value) => {
    if (!looksLikePaymentCodeUrl(value)) {
      return false
    }

    return key.includes('url')
      || key.includes('image')
      || key.includes('qr')
      || key.includes('qrcode')
      || key.includes('code')
  })
  const codeValue = findNestedString(input, (key, value) => {
    if (looksLikePaymentCodeUrl(value)) {
      return false
    }

    return key.includes('token')
      || key.includes('code')
      || key.includes('value')
      || key.includes('number')
      || key.includes('no')
      || key.includes('payment')
  })

  if (!codeUrl && !codeValue) {
    return null
  }

  return {
    codeUrl: codeUrl ? resolveBackendAMediaUrl(codeUrl) ?? codeUrl : null,
    codeValue,
  }
}

export function createBackendAMemberCenterQuery(
  memberAuthSession: MemberAuthSession,
  memberAssetsService: MemberAssetsService,
): MemberCenterQuery {
  const getOrderListPageData = createBackendAOrderListPageDataReader(memberAuthSession)
  const authHttpClient = createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })

  async function getPlatformSettings() {
    return backendAHttpClient.get<BackendAPlatformSettingsDto>('/api/v1/platform/settings')
  }

  async function getMemberOrderSummary() {
    const orderListPageData = await getOrderListPageData()

    return orderListPageData.orders.reduce<MemberOrderSummary>((summary, order) => {
      switch (order.status) {
        case 'pending-payment':
          summary.pendingPaymentCount += 1
          break
        case 'pending-shipment':
          summary.pendingShipmentCount += 1
          break
        case 'pending-receipt':
          summary.pendingReceiptCount += 1
          break
        case 'pending-review':
          summary.pendingReviewCount += 1
          break
        case 'refunding':
        case 'returning':
          summary.refundAndReturnCount += 1
          break
        default:
          break
      }

      return summary
    }, { ...emptyMemberOrderSummary })
  }

  async function getMemberCoupons() {
    const response = await authHttpClient.get<BackendAUserCouponDto[] | { data?: BackendAUserCouponDto[] | { data?: BackendAUserCouponDto[] } }>(
      '/api/v1/coupons',
      {
        per_page: 100,
      },
    )

    return normalizeUserCouponItems(response)
      .map(mapUserCouponItem)
      .filter((item): item is MemberCouponListItem => item !== null)
  }

  return {
    async getMemberAboutPageData() {
      const platformSettings = await getPlatformSettings()
      return Promise.resolve(mapBackendAMemberAboutPageData(platformSettings))
    },

    async getMemberCardBindPageData() {
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(mapBackendAMemberCardBindPageData(snapshot.bindPage))
    },

    async getMemberCardsPageData() {
      const snapshot = await memberAssetsService.getSnapshot()
      return Promise.resolve(mapBackendAMemberCardsPageData(snapshot))
    },

    async getMemberCenterPageData() {
      const [products, snapshot, coupons, memberOrderSummary, platformSettings] = await Promise.all([
        backendAProductRepository.getFeaturedProductSummaries(),
        memberAssetsService.getSnapshot(),
        getMemberCoupons(),
        getMemberOrderSummary(),
        getPlatformSettings(),
      ])
      return Promise.resolve(
        mapBackendAMemberCenterPageData(
          products,
          memberAuthSession.getSnapshot().authResult,
          snapshot.balanceAmount,
          coupons.filter((coupon) => !isUsedCoupon(coupon)).length,
          memberOrderSummary,
          platformSettings,
        ),
      )
    },

    async getMemberCouponsPageData() {
      return Promise.resolve(mapBackendAMemberCouponsPageData(await getMemberCoupons()))
    },

    async getMemberFavoritesPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      return Promise.resolve(mapBackendAMemberFavoritesPageData(products))
    },

    async getMemberHistoryPageData() {
      const products = await backendAProductRepository.getFeaturedProductSummaries()
      return Promise.resolve(mapBackendAMemberHistoryPageData(products))
    },

    async getMemberPaymentCodePageData() {
      const paymentCode = normalizeBackendAPaymentCode(
        await authHttpClient.get<unknown>('/api/v1/offline-payments/payment-code'),
      )

      return Promise.resolve(mapBackendAMemberPaymentCodePageData(paymentCode))
    },

    async getMemberProfileNamePageData() {
      return Promise.resolve(mapBackendAMemberProfileNamePageData(memberAuthSession.getSnapshot().authResult))
    },

    async getMemberSettingsPageData() {
      return Promise.resolve(mapBackendAMemberSettingsPageData(memberAuthSession.getSnapshot().authResult))
    },
  }
}
