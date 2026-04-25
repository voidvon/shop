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
import type { MemberOrderSummary } from '../../../domain/member-center-page-data'

const emptyMemberOrderSummary: MemberOrderSummary = {
  pendingPaymentCount: 0,
  pendingReceiptCount: 0,
  pendingReviewCount: 0,
  pendingShipmentCount: 0,
  refundAndReturnCount: 0,
}

function isAfterSaleInProgress(order: { status: string; statusText: string }) {
  if (order.status !== 'refunding' && order.status !== 'returning') {
    return false
  }

  const statusText = order.statusText.trim()

  return !statusText.includes('完成')
    && !statusText.includes('成功')
    && !statusText.includes('已退款')
    && !statusText.includes('已退货')
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
          if (isAfterSaleInProgress(order)) {
            summary.refundAndReturnCount += 1
          }
          break
        default:
          break
      }

      return summary
    }, { ...emptyMemberOrderSummary })
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
      const [products, snapshot, memberOrderSummary, platformSettings] = await Promise.all([
        backendAProductRepository.getFeaturedProductSummaries(),
        memberAssetsService.getSnapshot(),
        getMemberOrderSummary(),
        getPlatformSettings(),
      ])
      return Promise.resolve(
        mapBackendAMemberCenterPageData(
          products,
          memberAuthSession.getSnapshot().authResult,
          snapshot.balanceAmount,
          0,
          memberOrderSummary,
          platformSettings,
        ),
      )
    },

    async getMemberCouponsPageData() {
      return Promise.resolve(mapBackendAMemberCouponsPageData([]))
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
