import type {
  AboutPageData,
  AccountCapability,
  AccountSecurityState,
  AuthResult,
  CardBindingPageData,
  CardBindingResult,
  FeedbackPageData,
  FeedbackResult,
  MemberAssetsPageData,
  MemberCenterPageData,
  MemberCollectionsPageData,
  MemberSettingsPageData,
  PasswordResetPageData,
  PasswordResetVerificationResult,
  ProfileNamePageData,
  ProfileNameResult,
} from '@/shared/types/modules'

import { mockAddresses, mockImageUrl, mockProducts, mockStores, mockUser } from './core'

export const mockAccountCapabilities: AccountCapability[] = [
  'wechat-login',
  'wechat-mobile-bind',
  'wechat-scan-card',
  'recharge-card-payment',
  'payment-code',
]

export const mockAccountSecurityState: AccountSecurityState = {
  canResetPassword: true,
  hasBoundMobile: true,
  hasPaymentPassword: true,
}

export const mockAuthResult: AuthResult = {
  capabilities: mockAccountCapabilities,
  security: mockAccountSecurityState,
  session: {
    accessToken: 'mock-access-token',
    expiresAt: '2026-12-31T23:59:59.000Z',
    refreshToken: 'mock-refresh-token',
  },
  userInfo: {
    avatarUrl: mockUser.avatarUrl,
    email: mockUser.email,
    mobile: mockUser.mobile,
    nickname: mockUser.nickname,
    userId: mockUser.userId,
    username: mockUser.username,
  },
}

export const mockPasswordResetPageData: PasswordResetPageData = {
  captchaImageUrl: mockImageUrl,
  captchaLength: 4,
  currentMobile: mockUser.mobile,
  requestState: {
    message: null,
    status: 'idle',
  },
  security: mockAccountSecurityState,
  smsCodeLength: 6,
  smsCountdownSeconds: 0,
}

export const mockPasswordResetVerificationResult: PasswordResetVerificationResult = {
  nextStepUrl: '/member/password/step-2',
  verified: true,
}

export const mockMemberCenterPageData: MemberCenterPageData = {
  counts: {
    browsingCount: 12,
    cartCount: 3,
    favoritesCount: 8,
  },
  orderSummary: {
    pendingPaymentCount: 1,
    pendingReceiptCount: 1,
    pendingReviewCount: 2,
    pendingShipmentCount: 1,
    refundAndReturnCount: 1,
  },
  profile: {
    avatarUrl: mockUser.avatarUrl,
    isLoggedIn: true,
    username: mockUser.nickname,
  },
  servicePhone: '400-800-2026',
  shortcuts: [
    { key: 'cards', label: '我的卡券', route: '/member/assets/cards' },
    { key: 'payment-code', label: '付款码', route: '/member/assets/payment-code' },
    { key: 'balance', label: '账户余额', route: '/member/assets/balance' },
    { key: 'settings', label: '用户设置', route: '/member/settings' },
  ],
  tipText: '文惠卡、余额与订单能力均可先走 mock 流程联调。',
}

export const mockMemberSettingsPageData: MemberSettingsPageData = {
  security: mockAccountSecurityState,
  settings: [
    { key: 'login-password', label: '登录密码', route: '/member/password', value: '修改登录密码' },
    { key: 'profile-name', label: '用户昵称', route: '/member/profile-name', value: mockUser.nickname },
    { key: 'mobile', label: '手机号码', route: '/member/mobile', value: mockUser.mobile },
    { key: 'payment-password', label: '支付密码', route: '/member/pay-password', value: '已设置' },
    { key: 'about', label: '关于我们', route: '/member/about', value: null },
  ],
}

export const mockProfileNamePageData: ProfileNamePageData = {
  currentNickname: mockUser.nickname,
  maxLength: 20,
}

export const mockProfileNameResult: ProfileNameResult = {
  nickname: '晨林先生',
}

export const mockAboutPageData: AboutPageData = {
  companyName: '武汉城市文创科技有限公司',
  copyrightYear: 2026,
  operatorName: '武汉城市文创科技有限公司',
  organizerName: '武汉文化消费促进中心',
  platformBackground: '面向城市文化消费与商户联动的公共服务平台。',
  platformMission: '连接本地特色商品、文化活动与消费补贴，形成可持续的数字化消费入口。',
}

export const mockAddressBookPageData = {
  addresses: mockAddresses.map((address) => ({
    addressDetail: address.address,
    id: address.addressId,
    isDefault: address.isDefault,
    recipientMobile: address.recipientPhone,
    recipientName: address.recipientName,
  })),
}

export const mockMemberAssetsPageData: MemberAssetsPageData = {
  balanceAccounts: [
    {
      accountId: 'balance-account-1',
      availableAmount: 200,
      balanceTypeCode: 'cake',
      balanceTypeId: 1,
      balanceTypeName: '蛋糕余额',
      frozenAmount: 0,
    },
    {
      accountId: 'balance-account-2',
      availableAmount: 168.5,
      balanceTypeCode: 'general',
      balanceTypeId: 2,
      balanceTypeName: '通用余额',
      frozenAmount: 0,
    },
  ],
  balanceAmount: 368.5,
  balanceLogs: [
    { amount: 120, description: '充值卡余额转入', direction: 'income', id: 'balance-log-1', occurredAt: '2026-03-01 09:20:00' },
    { amount: 59.9, description: '门店付款码消费', direction: 'expense', id: 'balance-log-2', occurredAt: '2026-03-08 18:42:00' },
  ],
  cards: [
    {
      amount: 200,
      cardId: 'card-001',
      cardNumber: '6688990011223344',
      cardTitle: '文惠消费卡',
      effectiveAt: '2026-01-01 00:00:00',
      status: 'available',
      usedAt: null,
    },
    {
      amount: 0,
      cardId: 'card-002',
      cardNumber: '6688990055667788',
      cardTitle: '节庆礼遇卡',
      effectiveAt: '2025-10-01 00:00:00',
      status: 'disabled',
      usedAt: '2026-02-18 12:00:00',
    },
  ],
  paymentCode: {
    codeUrl: mockImageUrl,
    codeValue: 'PAY-CODE-20260319',
  },
}

export const mockCardBindingPageData: CardBindingPageData = {
  canScanByWechat: true,
  cardNumber: null,
}

export const mockCardBindingResult: CardBindingResult = {
  cardNumber: '6688990099001122',
  redirectUrl: '/member/assets/balance-transfer',
}

export const mockMemberCollectionsPageData: MemberCollectionsPageData = {
  browsingHistory: mockProducts.slice(1, 4).map((product) => ({
    productId: product.productId,
    productImageUrl: product.imageUrl,
    productName: product.productName,
    productPrice: product.price,
  })),
  favoriteProducts: mockProducts.slice(0, 2).map((product) => ({
    productId: product.productId,
    productImageUrl: product.imageUrl,
    productName: product.productName,
    productPrice: product.price,
  })),
  favoriteStores: mockStores.slice(0, 2).map((store) => ({
    favoriteCount: store.followerCount,
    productCount: mockProducts.filter((product) => product.storeId === store.storeId).length,
    storeId: store.storeId,
    storeLogoUrl: store.logoUrl,
    storeName: store.storeName,
  })),
}

export const mockFeedbackPageData: FeedbackPageData = {
  content: '希望补充更多城市文化主题礼盒，并支持门店自提时间选择。',
  currentLength: 29,
  maxLength: 300,
}

export const mockFeedbackResult: FeedbackResult = {
  message: '反馈已提交，我们会尽快处理。',
  success: true,
}

export const mockAccountData = {
  aboutPageData: mockAboutPageData,
  accountSecurityState: mockAccountSecurityState,
  authResult: mockAuthResult,
  capabilities: mockAccountCapabilities,
  cardBindingPageData: mockCardBindingPageData,
  cardBindingResult: mockCardBindingResult,
  feedbackPageData: mockFeedbackPageData,
  feedbackResult: mockFeedbackResult,
  memberAssetsPageData: mockMemberAssetsPageData,
  memberCenterPageData: mockMemberCenterPageData,
  memberCollectionsPageData: mockMemberCollectionsPageData,
  memberSettingsPageData: mockMemberSettingsPageData,
  passwordResetPageData: mockPasswordResetPageData,
  passwordResetVerificationResult: mockPasswordResetVerificationResult,
  profileNamePageData: mockProfileNamePageData,
  profileNameResult: mockProfileNameResult,
}
