import type { BalanceAccountInfo } from '@/shared/types/modules'

function isGeneralBalanceAccount(account: Pick<BalanceAccountInfo, 'balanceTypeCode' | 'balanceTypeName'>) {
  const balanceTypeCode = account.balanceTypeCode?.trim().toLowerCase() ?? ''
  const balanceTypeName = account.balanceTypeName.trim()

  return balanceTypeName === '通用余额' || balanceTypeCode === 'general' || balanceTypeCode === 'default'
}

export function sortBalanceAccountsForDisplay(accounts: readonly BalanceAccountInfo[]) {
  return [...accounts].sort((left, right) => {
    const leftPriority = isGeneralBalanceAccount(left) ? 0 : 1
    const rightPriority = isGeneralBalanceAccount(right) ? 0 : 1

    return leftPriority - rightPriority
  })
}
