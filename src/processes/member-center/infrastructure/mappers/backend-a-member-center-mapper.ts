import type { ProductSummary } from '@/entities/product'
import type { AuthResult } from '@/shared/types/modules'
import type { MemberAssetsSnapshot } from '../../domain/member-assets-service'
import { filterVisibleMemberSettings } from '../../application/member-settings-policy'

import type {
  MemberAboutPageData,
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberOrderSummary,
  MemberProfileNamePageData,
  MemberProductListItem,
  MemberSettingsPageData,
} from '../../domain/member-center-page-data'

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
    balanceAmount: snapshot.balanceAmount,
    balanceLogs: snapshot.balanceLogs,
    redemptionRecords: snapshot.redemptionRecords,
  }
}

export function mapBackendAMemberSettingsPageData(authResult: AuthResult | null): MemberSettingsPageData {
  const security = authResult?.security ?? {
    canResetPassword: true,
    hasBoundMobile: Boolean(authResult?.userInfo.mobile),
    hasPaymentPassword: false,
  }
  const capabilities = new Set(authResult?.capabilities ?? [])
  const mobile = authResult?.userInfo.mobile
    ? `${authResult.userInfo.mobile.slice(0, 3)}****${authResult.userInfo.mobile.slice(-4)}`
    : '未绑定'
  const settings: MemberSettingsPageData['settings'] = [
    {
      key: 'login-password',
      label: '登录密码',
      route: '/member/password',
      value: security.canResetPassword ? '可修改' : '暂不支持修改',
    },
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
      key: 'payment-password',
      label: '支付密码',
      route: '/member/pay-password',
      value: security.hasPaymentPassword ? '已设置' : '未设置',
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

export function mapBackendAMemberAboutPageData(): MemberAboutPageData {
  return {
    companyName: 'Backend A 城市文化服务有限公司',
    copyrightYear: 2026,
    operatorName: 'Backend A 城市文化服务有限公司',
    organizerName: 'Backend A 消费促进联合体',
    platformBackground: '面向多商户、多业态城市消费场景的统一会员与交易适配前端。',
    platformMission: '通过统一契约和后端适配层，提供稳定的商城会员体验。',
  }
}

export function mapBackendAMemberCenterPageData(
  products: ProductSummary[],
  authResult: AuthResult | null,
  balanceAmount: number,
  orderSummary?: MemberOrderSummary,
): MemberCenterPageData {
  const favoriteItems = products.slice(0, 2)
  const historyItems = products.slice(0, 3)
  const displayName = authResult?.userInfo.nickname ?? authResult?.userInfo.username ?? 'Backend A 用户'

  return {
    counts: {
      browsingCount: historyItems.length,
      cartCount: 1,
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
    servicePhone: '400-900-2026',
    shortcuts: [
      { key: 'cards', label: '我的卡券', route: '/member/assets/cards' },
      { key: 'payment-code', label: '付款码', route: '/member/assets/payment-code' },
      { key: 'balance', label: '账户余额', route: '/member/assets/balance' },
      { key: 'settings', label: '用户设置', route: '/member/settings' },
    ],
    tipText: `当前页面数据经 Backend A 适配层统一转换。当前账户余额 ${balanceAmount.toFixed(2)}。`,
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
