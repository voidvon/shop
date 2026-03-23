import type {
  MemberCardBindPageData,
  MemberCardRedemptionRecord,
} from './member-center-page-data'
import type { AccountBalanceLog } from '@/shared/types/modules'

export interface MemberAssetsSnapshot {
  balanceAmount: number
  balanceLogs: AccountBalanceLog[]
  bindPage: MemberCardBindPageData
  redemptionRecords: MemberCardRedemptionRecord[]
}

export interface BindMemberCardCommand {
  cardNumber: string
  cardSecret: string
}

export interface BindMemberCardResult {
  balanceAmount: number
  redemption: MemberCardRedemptionRecord
}

export interface SpendMemberBalanceCommand {
  amount: number
  description?: string
}

export interface MemberAssetsService {
  bindMemberCard(command: BindMemberCardCommand): Promise<BindMemberCardResult>
  getSnapshot(): Promise<MemberAssetsSnapshot>
  spendBalance(command: SpendMemberBalanceCommand): Promise<number>
}
