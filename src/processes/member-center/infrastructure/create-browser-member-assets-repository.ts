import type { AccountBalanceLog } from '@/shared/types/modules'
import {
  creditBrowserMemberBalance,
  readBrowserMemberBalanceRecord,
  spendBrowserMemberBalance,
} from './browser-member-balance-storage'
import {
  redeemBrowserMemberCard,
  readBrowserMemberCardRedemptions,
} from './browser-member-card-redemption-storage'

import type {
  MemberAssetsRepository,
} from './member-assets-repository'
import type {
  MemberCardBindPageData,
  MemberCardRedemptionRecord,
} from '../domain/member-center-page-data'

export interface BrowserMemberAssetsRepositoryOptions {
  getBindPageData: () => MemberCardBindPageData
  getScopeKey: () => string
  getSeedBalance: () => number
  getSeedBalanceLogs: () => AccountBalanceLog[]
  getSeedRedemptionRecords: () => MemberCardRedemptionRecord[]
  namespace: string
}

function resolveScopeKey(getScopeKey: () => string) {
  const scopeKey = getScopeKey().trim()
  return scopeKey || 'guest'
}

export function createBrowserMemberAssetsRepository(
  options: BrowserMemberAssetsRepositoryOptions,
): MemberAssetsRepository {
  return {
    async creditBalance(command) {
      return creditBrowserMemberBalance(
        options.namespace,
        resolveScopeKey(options.getScopeKey),
        options.getSeedBalance,
        options.getSeedBalanceLogs,
        command.amount,
        command.description,
      )
    },

    async getBindPageData() {
      return options.getBindPageData()
    },

    async readBalance() {
      const record = readBrowserMemberBalanceRecord(
        options.namespace,
        resolveScopeKey(options.getScopeKey),
        options.getSeedBalance,
        options.getSeedBalanceLogs,
      )

      return {
        balanceAmount: record.balanceAmount,
        balanceLogs: record.logs,
      }
    },

    async readRedemptionRecords() {
      return readBrowserMemberCardRedemptions(
        options.namespace,
        resolveScopeKey(options.getScopeKey),
        options.getSeedRedemptionRecords,
      )
    },

    async redeemMemberCard(command) {
      return redeemBrowserMemberCard(
        options.namespace,
        resolveScopeKey(options.getScopeKey),
        options.getSeedRedemptionRecords,
        command,
      )
    },

    async spendBalance(command) {
      return spendBrowserMemberBalance(
        options.namespace,
        resolveScopeKey(options.getScopeKey),
        options.getSeedBalance,
        options.getSeedBalanceLogs,
        command.amount,
        command.description,
      )
    },
  }
}
