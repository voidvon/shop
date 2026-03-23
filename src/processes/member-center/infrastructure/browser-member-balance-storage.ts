const storageVersion = 'v1'

export interface BrowserBalanceLogRecord {
  amount: number
  description: string
  direction: 'income' | 'expense'
  id: string
  occurredAt: string
}

interface MemberBalanceRecord {
  balanceAmount: number
  logs: BrowserBalanceLogRecord[]
}

function createStorageKey(namespace: string, scopeKey: string) {
  return `shop:${namespace}:member-balance:${scopeKey}:${storageVersion}`
}

function createOccurredAt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function normalizeBalanceLogs(value: unknown): BrowserBalanceLogRecord[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const target = item as Partial<BrowserBalanceLogRecord>

    if (
      typeof target.amount !== 'number'
      || !Number.isFinite(target.amount)
      || typeof target.description !== 'string'
      || (target.direction !== 'income' && target.direction !== 'expense')
      || typeof target.id !== 'string'
      || typeof target.occurredAt !== 'string'
    ) {
      return []
    }

    return [{
      amount: Math.max(target.amount, 0),
      description: target.description,
      direction: target.direction,
      id: target.id,
      occurredAt: target.occurredAt,
    }]
  })
}

function normalizeMemberBalanceRecord(value: unknown): MemberBalanceRecord | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const target = value as Partial<MemberBalanceRecord>

  if (typeof target.balanceAmount !== 'number' || !Number.isFinite(target.balanceAmount)) {
    return null
  }

  return {
    balanceAmount: Math.max(target.balanceAmount, 0),
    logs: normalizeBalanceLogs(target.logs),
  }
}

function createSeedRecord(getSeedBalance: () => number, getSeedLogs?: () => BrowserBalanceLogRecord[]): MemberBalanceRecord {
  return {
    balanceAmount: Math.max(getSeedBalance(), 0),
    logs: getSeedLogs ? [...getSeedLogs()] : [],
  }
}

function writeRecord(namespace: string, scopeKey: string, record: MemberBalanceRecord) {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = createStorageKey(namespace, scopeKey)
  window.localStorage.setItem(storageKey, JSON.stringify(record))
}

export function readBrowserMemberBalance(
  namespace: string,
  scopeKey: string,
  getSeedBalance: () => number,
  getSeedLogs?: () => BrowserBalanceLogRecord[],
) {
  return readBrowserMemberBalanceRecord(namespace, scopeKey, getSeedBalance, getSeedLogs).balanceAmount
}

export function readBrowserMemberBalanceRecord(
  namespace: string,
  scopeKey: string,
  getSeedBalance: () => number,
  getSeedLogs?: () => BrowserBalanceLogRecord[],
) {
  if (typeof window === 'undefined') {
    return createSeedRecord(getSeedBalance, getSeedLogs)
  }

  const storageKey = createStorageKey(namespace, scopeKey)
  const rawValue = window.localStorage.getItem(storageKey)

  if (!rawValue) {
    const seedRecord = createSeedRecord(getSeedBalance, getSeedLogs)
    writeRecord(namespace, scopeKey, seedRecord)
    return seedRecord
  }

  try {
    const record = normalizeMemberBalanceRecord(JSON.parse(rawValue))

    if (record) {
      return record
    }
  } catch {
  }

  const seedRecord = createSeedRecord(getSeedBalance, getSeedLogs)
  writeRecord(namespace, scopeKey, seedRecord)
  return seedRecord
}

export function writeBrowserMemberBalanceRecord(
  namespace: string,
  scopeKey: string,
  record: MemberBalanceRecord,
) {
  writeRecord(namespace, scopeKey, record)
}

export function spendBrowserMemberBalance(
  namespace: string,
  scopeKey: string,
  getSeedBalance: () => number,
  getSeedLogs: (() => BrowserBalanceLogRecord[]) | undefined,
  amount: number,
  description = '商城订单余额支付',
) {
  const currentRecord = readBrowserMemberBalanceRecord(namespace, scopeKey, getSeedBalance, getSeedLogs)
  const currentBalance = currentRecord.balanceAmount

  if (amount > currentBalance) {
    throw new Error('账户余额不足')
  }

  const nextBalance = currentBalance - amount
  writeRecord(namespace, scopeKey, {
    balanceAmount: nextBalance,
    logs: [
      {
        amount,
        description,
        direction: 'expense',
        id: `balance-log-${Date.now()}`,
        occurredAt: createOccurredAt(),
      },
      ...currentRecord.logs,
    ],
  })

  return nextBalance
}

export function creditBrowserMemberBalance(
  namespace: string,
  scopeKey: string,
  getSeedBalance: () => number,
  getSeedLogs: (() => BrowserBalanceLogRecord[]) | undefined,
  amount: number,
  description = '卡券充值到账',
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('充值金额无效')
  }

  const currentRecord = readBrowserMemberBalanceRecord(namespace, scopeKey, getSeedBalance, getSeedLogs)
  const nextBalance = currentRecord.balanceAmount + amount

  writeRecord(namespace, scopeKey, {
    balanceAmount: nextBalance,
    logs: [
      {
        amount,
        description,
        direction: 'income',
        id: `balance-log-${Date.now()}`,
        occurredAt: createOccurredAt(),
      },
      ...currentRecord.logs,
    ],
  })

  return nextBalance
}
