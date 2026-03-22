import type {
  MemberHistoryItem,
  SaveMemberHistoryItem,
} from '../domain/member-history'
import type { MemberHistoryRepository } from '../domain/member-history-repository'

const memberHistoryStorageKey = 'shop.member-history'
const maxHistoryItems = 50

function canUseStorage() {
  return typeof window !== 'undefined'
}

function normalizeHistoryItem(value: unknown): MemberHistoryItem | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<MemberHistoryItem>

  if (
    typeof candidate.productId !== 'string'
    || typeof candidate.productName !== 'string'
    || typeof candidate.productPrice !== 'number'
    || typeof candidate.storeName !== 'string'
  ) {
    return null
  }

  return {
    productId: candidate.productId,
    productImageUrl: typeof candidate.productImageUrl === 'string' ? candidate.productImageUrl : null,
    productName: candidate.productName,
    productPrice: candidate.productPrice,
    storeName: candidate.storeName,
    viewedAt: typeof candidate.viewedAt === 'number' ? candidate.viewedAt : Date.now(),
  }
}

function readStoredHistory() {
  if (!canUseStorage()) {
    return []
  }

  const storedValue = window.localStorage.getItem(memberHistoryStorageKey)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!Array.isArray(parsedValue)) {
      window.localStorage.removeItem(memberHistoryStorageKey)
      return []
    }

    return parsedValue
      .map(normalizeHistoryItem)
      .filter((item): item is MemberHistoryItem => Boolean(item))
      .sort((left, right) => right.viewedAt - left.viewedAt)
  } catch {
    window.localStorage.removeItem(memberHistoryStorageKey)
    return []
  }
}

function writeStoredHistory(items: MemberHistoryItem[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(memberHistoryStorageKey, JSON.stringify(items))
}

export function createBrowserMemberHistoryRepository(): MemberHistoryRepository {
  return {
    async countHistory() {
      return readStoredHistory().length
    },

    async getHistory() {
      return readStoredHistory()
    },

    async removeHistory(productId) {
      const nextItems = readStoredHistory().filter((item) => item.productId !== productId)
      writeStoredHistory(nextItems)
      return nextItems
    },

    async saveHistory(item: SaveMemberHistoryItem) {
      const historyItem: MemberHistoryItem = {
        ...item,
        viewedAt: Date.now(),
      }
      const nextItems = [
        historyItem,
        ...readStoredHistory().filter((candidate) => candidate.productId !== item.productId),
      ].slice(0, maxHistoryItems)

      writeStoredHistory(nextItems)
      return nextItems
    },
  }
}
