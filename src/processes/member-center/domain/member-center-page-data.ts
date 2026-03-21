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
  servicePhone: string
  shortcuts: MemberShortcut[]
  tipText: string
}

export interface MemberCardsPageData {
  balanceAmount: number
  cardNumber: string | null
}

export interface MemberCardBindPageData {
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
