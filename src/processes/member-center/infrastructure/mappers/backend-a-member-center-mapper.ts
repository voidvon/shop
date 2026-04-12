import type { ProductSummary } from '@/entities/product'
import type { AuthResult } from '@/shared/types/modules'
import type { MemberAssetsSnapshot } from '../../domain/member-assets-service'
import { filterVisibleMemberSettings } from '../../application/member-settings-policy'

import type {
  MemberAboutPageData,
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberCouponListItem,
  MemberCouponsPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberOrderSummary,
  MemberPaymentCodePageData,
  MemberProfileNamePageData,
  MemberProductListItem,
  MemberSettingsPageData,
} from '../../domain/member-center-page-data'

export interface BackendAPlatformSettingsDto {
  address: string | null
  banners: string[]
  business_phone: string | null
  company_name: string
  customer_service_phone: string | null
  customer_service_wechat: string | null
  domain: string | null
  icp_number: string | null
  id: number
  logo: string | null
  promo_video: string | null
}

function mapBackendAMemberProductListItem(product: ProductSummary): MemberProductListItem {
  return {
    productId: product.id,
    productImageUrl: product.coverImageUrl,
    productName: product.name,
    productPrice: product.price,
    storeName: 'Backend A 选品馆',
  }
}

export function mapBackendAMemberCardBindPageData(bindPageData: MemberCardBindPageData): MemberCardBindPageData {
  return {
    ...bindPageData,
  }
}

export function mapBackendAMemberCardsPageData(snapshot: MemberAssetsSnapshot): MemberCardsPageData {
  return {
    balanceAccounts: snapshot.balanceAccounts.map((account) => ({ ...account })),
    balanceAmount: snapshot.balanceAmount,
    balanceLogs: snapshot.balanceLogs,
    redemptionRecords: snapshot.redemptionRecords,
  }
}

export function mapBackendAMemberPaymentCodePageData(
  paymentCode: MemberPaymentCodePageData['paymentCode'],
): MemberPaymentCodePageData {
  return {
    paymentCode,
  }
}

export function mapBackendAMemberSettingsPageData(authResult: AuthResult | null): MemberSettingsPageData {
  const security = authResult?.security ?? {
    canResetPassword: false,
    hasBoundMobile: Boolean(authResult?.userInfo.mobile),
    hasPaymentPassword: false,
  }
  const mobile = authResult?.userInfo.mobile
    ? `${authResult.userInfo.mobile.slice(0, 3)}****${authResult.userInfo.mobile.slice(-4)}`
    : '未绑定'
  const settings: MemberSettingsPageData['settings'] = [
    {
      key: 'profile-name',
      label: '用户昵称',
      route: '/member/profile-name',
      value: authResult?.userInfo.nickname ?? 'Backend A 用户',
    },
    {
      key: 'mobile',
      label: '手机号码',
      route: '/member/mobile',
      value: mobile,
    },
    {
      key: 'about',
      label: '关于我们',
      route: '/member/about',
      value: null,
    },
  ]

  return {
    security,
    settings: filterVisibleMemberSettings(settings, authResult),
  }
}

export function mapBackendAMemberProfileNamePageData(authResult: AuthResult | null): MemberProfileNamePageData {
  return {
    currentNickname: authResult?.userInfo.nickname ?? 'Backend A 用户',
    maxLength: 20,
  }
}

export function mapBackendAMemberAboutPageData(
  platformSettings?: BackendAPlatformSettingsDto | null,
): MemberAboutPageData {
  return {
    businessPhone: platformSettings?.business_phone?.trim() || '',
    companyAddress: platformSettings?.address?.trim() || '',
    companyName: platformSettings?.company_name?.trim() || 'Backend A 城市文化服务有限公司',
    customerServicePhone: platformSettings?.customer_service_phone?.trim() || '',
    customerServiceWechat: platformSettings?.customer_service_wechat?.trim() || '',
  }
}

export function mapBackendAMemberCenterPageData(
  products: ProductSummary[],
  authResult: AuthResult | null,
  balanceAmount: number,
  couponCount: number,
  orderSummary?: MemberOrderSummary,
  platformSettings?: BackendAPlatformSettingsDto | null,
): MemberCenterPageData {
  const favoriteItems = products.slice(0, 2)
  const historyItems = products.slice(0, 3)
  const displayName = authResult?.userInfo.nickname ?? authResult?.userInfo.username ?? 'Backend A 用户'

  return {
    counts: {
      browsingCount: historyItems.length,
      cartCount: 1,
      couponCount,
      favoritesCount: favoriteItems.length,
    },
    orderSummary: orderSummary
      ? { ...orderSummary }
      : {
          pendingPaymentCount: 1,
          pendingReceiptCount: 0,
          pendingReviewCount: 1,
          pendingShipmentCount: 1,
          refundAndReturnCount: 0,
        },
    profile: {
      avatarUrl: authResult?.userInfo.avatarUrl ?? null,
      isLoggedIn: authResult !== null,
      username: displayName,
    },
    servicePhone:
      platformSettings?.customer_service_phone?.trim()
      || platformSettings?.business_phone?.trim()
      || null,
    shortcuts: [
      { key: 'cards', label: '我的卡券', route: '/member/assets/cards' },
      { key: 'payment-code', label: '付款码', route: '/member/assets/payment-code' },
      { key: 'balance', label: '账户余额', route: '/member/assets/balance' },
      { key: 'settings', label: '用户设置', route: '/member/settings' },
    ],
    tipText: '',
  }
}

export function mapBackendAMemberFavoritesPageData(products: ProductSummary[]): MemberFavoritesPageData {
  return {
    items: products.slice(0, 2).map(mapBackendAMemberProductListItem),
  }
}

export function mapBackendAMemberHistoryPageData(products: ProductSummary[]): MemberHistoryPageData {
  return {
    items: products.slice(0, 3).map(mapBackendAMemberProductListItem),
  }
}

export function mapBackendAMemberCouponsPageData(items: MemberCouponListItem[]): MemberCouponsPageData {
  return {
    items: items.map((item) => ({ ...item })),
  }
}
