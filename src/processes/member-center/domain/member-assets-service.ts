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

export interface MemberRechargeCustomAmountRule {
  enabled: boolean
  max: number
  min: number
}

export interface MemberRechargeOptions {
  amounts: number[]
  balanceTypeId: number | null
  customAmount: MemberRechargeCustomAmountRule
}

export interface CreateMemberRechargeCommand {
  amount: number
}

export interface CreateMemberRechargeResult {
  balanceAmount: number
}

export interface SpendMemberBalanceCommand {
  amount: number
  description?: string
}

export interface MemberAssetsService {
  bindMemberCard(command: BindMemberCardCommand): Promise<BindMemberCardResult>
  createWechatRecharge(command: CreateMemberRechargeCommand): Promise<CreateMemberRechargeResult>
  getSnapshot(): Promise<MemberAssetsSnapshot>
  getWechatRechargeOptions(): Promise<MemberRechargeOptions>
  lookupMemberCard(command: BindMemberCardCommand): Promise<LookupMemberCardResult>
  spendBalance(command: SpendMemberBalanceCommand): Promise<number>
}
