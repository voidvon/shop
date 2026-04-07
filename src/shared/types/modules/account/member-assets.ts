export interface MemberAssetCard {
  cardId: string
  cardTitle: string
  status: 'available' | 'disabled'
  cardNumber: string
  amount: number
  effectiveAt: string | null
  usedAt: string | null
}

export interface BalanceAccountInfo {
  accountId: string
  availableAmount: number
  balanceTypeCode: string | null
  balanceTypeId: number
  balanceTypeName: string
  frozenAmount: number
}

export interface AccountBalanceLog {
  id: string
  description: string
  occurredAt: string
  amount: number
  direction: 'income' | 'expense'
}

export interface PaymentCodeInfo {
  codeUrl: string
  codeValue: string
}

export interface MemberAssetsPageData {
  balanceAccounts: BalanceAccountInfo[]
  balanceAmount: number
  cards: MemberAssetCard[]
  balanceLogs: AccountBalanceLog[]
  paymentCode: PaymentCodeInfo | null
}

export interface CardBindingPageData {
  cardNumber: string | null
  canScanByWechat: boolean
}

export interface CardBindingResult {
  cardNumber: string
  redirectUrl: string
}
