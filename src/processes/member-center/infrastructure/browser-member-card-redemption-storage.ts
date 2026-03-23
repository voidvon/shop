import type { MemberCardRedemptionRecord } from '../domain/member-center-page-data'

const storageVersion = 'v1'

interface BrowserMemberCardRedemptionRecord extends MemberCardRedemptionRecord {}

function createStorageKey(namespace: string, scopeKey: string) {
  return `shop:${namespace}:member-card-redemptions:${scopeKey}:${storageVersion}`
}

function createOccurredAt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function normalizeRedemptionRecords(value: unknown): BrowserMemberCardRedemptionRecord[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const target = item as Partial<BrowserMemberCardRedemptionRecord>

    if (
      typeof target.amount !== 'number'
      || !Number.isFinite(target.amount)
      || typeof target.cardNumber !== 'string'
      || typeof target.cardTitle !== 'string'
      || typeof target.id !== 'string'
      || typeof target.occurredAt !== 'string'
      || typeof target.redeemedCode !== 'string'
    ) {
      return []
    }

    return [{
      amount: Math.max(target.amount, 0),
      cardNumber: target.cardNumber,
      cardTitle: target.cardTitle,
      id: target.id,
      occurredAt: target.occurredAt,
      redeemedCode: target.redeemedCode,
    }]
  })
}

export function readBrowserMemberCardRedemptions(
  namespace: string,
  scopeKey: string,
  getSeedRecords: () => BrowserMemberCardRedemptionRecord[],
) {
  if (typeof window === 'undefined') {
    return [...getSeedRecords()]
  }

  const storageKey = createStorageKey(namespace, scopeKey)
  const rawValue = window.localStorage.getItem(storageKey)

  if (!rawValue) {
    const seedRecords = [...getSeedRecords()]
    writeBrowserMemberCardRedemptions(namespace, scopeKey, seedRecords)
    return seedRecords
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    const records = normalizeRedemptionRecords(parsedValue)

    if (records) {
      return records
    }
  } catch {
  }

  const seedRecords = [...getSeedRecords()]
  writeBrowserMemberCardRedemptions(namespace, scopeKey, seedRecords)
  return seedRecords
}

export function writeBrowserMemberCardRedemptions(
  namespace: string,
  scopeKey: string,
  records: BrowserMemberCardRedemptionRecord[],
) {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = createStorageKey(namespace, scopeKey)
  window.localStorage.setItem(storageKey, JSON.stringify(records))
}

export interface RedeemMemberCardCommand {
  amount: number
  cardNumber: string
  cardTitle: string
  redeemedCode: string
}

export function redeemBrowserMemberCard(
  namespace: string,
  scopeKey: string,
  getSeedRecords: () => BrowserMemberCardRedemptionRecord[],
  command: RedeemMemberCardCommand,
) {
  if (!Number.isFinite(command.amount) || command.amount <= 0) {
    throw new Error('充值金额无效')
  }

  const cardNumber = command.cardNumber.trim()
  const redeemedCode = command.redeemedCode.trim()

  if (!cardNumber) {
    throw new Error('卡券编号不能为空')
  }

  if (!redeemedCode) {
    throw new Error('兑换码不能为空')
  }

  const currentRecords = readBrowserMemberCardRedemptions(namespace, scopeKey, getSeedRecords)

  if (currentRecords.some((record) => record.cardNumber === cardNumber)) {
    throw new Error('该卡券已绑定充值，请勿重复提交')
  }

  if (currentRecords.some((record) => record.redeemedCode === redeemedCode)) {
    throw new Error('兑换码已使用')
  }

  const nextRecord: BrowserMemberCardRedemptionRecord = {
    amount: Math.max(command.amount, 0),
    cardNumber,
    cardTitle: command.cardTitle.trim() || '文惠储值卡',
    id: `card-redemption-${Date.now()}`,
    occurredAt: createOccurredAt(),
    redeemedCode,
  }

  const nextRecords = [nextRecord, ...currentRecords]
  writeBrowserMemberCardRedemptions(namespace, scopeKey, nextRecords)
  return nextRecord
}
