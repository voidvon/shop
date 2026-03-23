import type { AccountBalanceLog } from '@/shared/types/modules'
import type { SpendMemberBalanceCommand } from '../domain/member-assets-service'
import type {
  MemberCardBindPageData,
  MemberCardRedemptionRecord,
} from '../domain/member-center-page-data'

export interface MemberBalanceSnapshot {
  balanceAmount: number
  balanceLogs: AccountBalanceLog[]
}

export interface CreditMemberBalanceCommand {
  amount: number
  description: string
}

export interface RedeemMemberCardRecordCommand {
  amount: number
  cardNumber: string
  cardTitle: string
  redeemedCode: string
}

export interface MemberAssetsRepository {
  creditBalance(command: CreditMemberBalanceCommand): Promise<number>
  getBindPageData(): Promise<MemberCardBindPageData>
  readBalance(): Promise<MemberBalanceSnapshot>
  readRedemptionRecords(): Promise<MemberCardRedemptionRecord[]>
  redeemMemberCard(command: RedeemMemberCardRecordCommand): Promise<MemberCardRedemptionRecord>
  spendBalance(command: SpendMemberBalanceCommand): Promise<number>
}
