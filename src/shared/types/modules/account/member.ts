export interface MemberProfileSummary {
  isLoggedIn: boolean
  avatarUrl: string | null
  username: string | null
}

export interface MemberCountSummary {
  favoritesCount: number
  cartCount: number
  browsingCount: number
}

export interface MemberOrderSummary {
  pendingPaymentCount: number
  pendingShipmentCount: number
  pendingReceiptCount: number
  pendingReviewCount: number
  refundAndReturnCount: number
}

export interface MemberShortcutItem {
  key: 'cards' | 'payment-code' | 'balance' | 'settings'
  label: string
  route: string
}

export interface MemberCenterPageData {
  profile: MemberProfileSummary
  counts: MemberCountSummary
  orderSummary: MemberOrderSummary
  shortcuts: MemberShortcutItem[]
  tipText: string | null
  servicePhone: string | null
}

export interface MemberSettingItem {
  key:
    | 'login-password'
    | 'profile-name'
    | 'mobile'
    | 'payment-password'
    | 'address-book'
    | 'feedback'
    | 'about'
  label: string
  value: string | null
  route: string
}

export interface MemberSettingsPageData {
  security: {
    canResetPassword: boolean
    hasBoundMobile: boolean
    hasPaymentPassword: boolean
  }
  settings: MemberSettingItem[]
}

export interface ProfileNamePageData {
  currentNickname: string
  maxLength: number
}

export interface ProfileNameResult {
  nickname: string
}

export interface AboutPageData {
  organizerName: string
  operatorName: string
  platformBackground: string
  platformMission: string
  copyrightYear: number
  companyName: string
}

export interface AddressItem {
  id: string
  recipientName: string
  recipientMobile: string
  isDefault: boolean
  addressDetail: string
}

export interface AddressBookPageData {
  addresses: AddressItem[]
}
