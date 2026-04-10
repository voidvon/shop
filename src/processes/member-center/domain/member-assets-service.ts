import type {
  MemberCardBindPageData,
  MemberCardRedemptionRecord,
} from './member-center-page-data'
import type { AccountBalanceLog, BalanceAccountInfo } from '@/shared/types/modules'

export interface MemberAssetsSnapshot {
  balanceAccounts: BalanceAccountInfo[]
  balanceAmount: number
  balanceLogs: AccountBalanceLog[]
  bindPage: MemberCardBindPageData
  redemptionRecords: MemberCardRedemptionRecord[]
}

export interface BindMemberCardCommand {
  cardNumber: string
  cardSecret: string
  mobile?: string
}

export interface LookupMemberCardResult {
  balanceTypeName: string | null
  canBind: boolean
  cardNumber: string
  currentAmount: number
  faceValue: number
  statusText: string
}

export interface BindMemberCardResult {
  balanceAmount: number
}

export interface SpendMemberBalanceCommand {
  amount: number
  description?: string
}

export interface MemberAssetsService {
  bindMemberCard(command: BindMemberCardCommand): Promise<BindMemberCardResult>
  getSnapshot(): Promise<MemberAssetsSnapshot>
  lookupMemberCard(command: BindMemberCardCommand): Promise<LookupMemberCardResult>
  spendBalance(command: SpendMemberBalanceCommand): Promise<number>
}
