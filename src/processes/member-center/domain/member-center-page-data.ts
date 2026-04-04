import type { AccountBalanceLog } from '@/shared/types/modules'

export interface MemberCenterCountSummary {
  browsingCount: number
  cartCount: number
  favoritesCount: number
}

export interface MemberOrderSummary {
  pendingPaymentCount: number
  pendingReceiptCount: number
  pendingReviewCount: number
  pendingShipmentCount: number
  refundAndReturnCount: number
}

export interface MemberProfileInfo {
  avatarUrl: string | null
  isLoggedIn: boolean
  username: string | null
}

export interface MemberShortcut {
  key: string
  label: string
  route: string
}

export interface MemberCenterPageData {
  counts: MemberCenterCountSummary
  orderSummary: MemberOrderSummary
  profile: MemberProfileInfo
  servicePhone: string | null
  shortcuts: MemberShortcut[]
  tipText: string
}

export interface MemberCardRedemptionRecord {
  amount: number
  cardNumber: string
  cardTitle: string
  id: string
  occurredAt: string
  redeemedCode: string
}

export interface MemberCardsPageData {
  balanceAmount: number
  balanceLogs: AccountBalanceLog[]
  redemptionRecords: MemberCardRedemptionRecord[]
}

export interface MemberPaymentCodeData {
  codeUrl: string | null
  codeValue: string | null
}

export interface MemberPaymentCodePageData {
  paymentCode: MemberPaymentCodeData | null
}

export interface MemberSettingsItem {
  key:
    | 'login-password'
    | 'profile-name'
    | 'mobile'
    | 'payment-password'
    | 'about'
  label: string
  route: string
  value: string | null
}

export interface MemberSettingsPageData {
  security: {
    canResetPassword: boolean
    hasBoundMobile: boolean
    hasPaymentPassword: boolean
  }
  settings: MemberSettingsItem[]
}

export interface MemberProfileNamePageData {
  currentNickname: string
  maxLength: number
}

export interface MemberAboutPageData {
  companyName: string
  copyrightYear: number
  operatorName: string
  organizerName: string
  platformBackground: string
  platformMission: string
}

export interface MemberCardBindPageData {
  canScanCode: boolean
  cardNumber: string | null
}

export interface MemberProductListItem {
  productId: string
  productImageUrl: string | null
  productName: string
  productPrice: number
  storeName: string
}

export interface MemberFavoritesPageData {
  items: MemberProductListItem[]
}

export interface MemberHistoryPageData {
  items: MemberProductListItem[]
}
