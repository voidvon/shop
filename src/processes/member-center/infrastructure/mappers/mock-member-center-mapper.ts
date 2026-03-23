import {
  getMockProduct,
  getMockStore,
  mockAccountData,
} from '@/shared/mocks'
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

type MockMemberProductListItem =
  (typeof mockAccountData.memberCollectionsPageData.favoriteProducts)[number]

function mapMockMemberProductListItem(input: MockMemberProductListItem): MemberProductListItem {
  const product = getMockProduct(input.productId)

  return {
    productId: input.productId,
    productImageUrl: input.productImageUrl ?? null,
    productName: input.productName,
    productPrice: input.productPrice,
    storeName: getMockStore(product?.storeId ?? '')?.storeName ?? '默认店铺',
  }
}

export function mapMockMemberCardBindPageData(bindPageData: MemberCardBindPageData): MemberCardBindPageData {
  return {
    ...bindPageData,
  }
}

export function mapMockMemberCardsPageData(snapshot: MemberAssetsSnapshot): MemberCardsPageData {
  return {
    balanceAmount: snapshot.balanceAmount,
    balanceLogs: snapshot.balanceLogs,
    redemptionRecords: snapshot.redemptionRecords,
  }
}

export function mapMockMemberSettingsPageData(authResult: AuthResult | null): MemberSettingsPageData {
  const security = authResult?.security ?? {
    canResetPassword: true,
    hasBoundMobile: Boolean(authResult?.userInfo.mobile),
    hasPaymentPassword: true,
  }
  const capabilities = new Set(authResult?.capabilities ?? mockAccountData.authResult.capabilities)
  const nickname = authResult?.userInfo.nickname ?? mockAccountData.profileNamePageData.currentNickname
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
      value: nickname,
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

export function mapMockMemberProfileNamePageData(authResult: AuthResult | null): MemberProfileNamePageData {
  return {
    currentNickname: authResult?.userInfo.nickname ?? mockAccountData.profileNamePageData.currentNickname,
    maxLength: mockAccountData.profileNamePageData.maxLength,
  }
}

export function mapMockMemberAboutPageData(): MemberAboutPageData {
  return {
    ...mockAccountData.aboutPageData,
  }
}

export function mapMockMemberCenterPageData(
  authResult: AuthResult | null,
  balanceAmount: number,
  orderSummary?: MemberOrderSummary,
): MemberCenterPageData {
  const displayName = authResult?.userInfo.nickname
    ?? authResult?.userInfo.username
    ?? mockAccountData.memberCenterPageData.profile.username

  return {
    counts: {
      ...mockAccountData.memberCenterPageData.counts,
      browsingCount: mockAccountData.memberCollectionsPageData.browsingHistory.length,
      favoritesCount: mockAccountData.memberCollectionsPageData.favoriteProducts.length,
    },
    orderSummary: orderSummary
      ? { ...orderSummary }
      : { ...mockAccountData.memberCenterPageData.orderSummary },
    profile: {
      avatarUrl: authResult?.userInfo.avatarUrl ?? mockAccountData.memberCenterPageData.profile.avatarUrl,
      isLoggedIn: authResult !== null,
      username: displayName,
    },
    servicePhone: mockAccountData.memberCenterPageData.servicePhone ?? '',
    shortcuts: mockAccountData.memberCenterPageData.shortcuts.map((shortcut) => ({ ...shortcut })),
    tipText: `文惠卡充值、余额消费与订单能力均可先走 mock 流程联调。当前账户余额 ${balanceAmount.toFixed(2)}。`,
  }
}

export function mapMockMemberFavoritesPageData(): MemberFavoritesPageData {
  return {
    items: mockAccountData.memberCollectionsPageData.favoriteProducts.map(mapMockMemberProductListItem),
  }
}

export function mapMockMemberHistoryPageData(): MemberHistoryPageData {
  return {
    items: mockAccountData.memberCollectionsPageData.browsingHistory.map(mapMockMemberProductListItem),
  }
}
