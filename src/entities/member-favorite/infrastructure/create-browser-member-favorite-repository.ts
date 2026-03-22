import type { MemberFavoriteItem } from '../domain/member-favorite'
import type { MemberFavoriteRepository } from '../domain/member-favorite-repository'

const memberFavoriteStoragePrefix = 'shop.member-favorites'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createMemberFavoriteStorageKey(userId: string) {
  return `${memberFavoriteStoragePrefix}.${userId}`
}

function readStoredFavorites(userId: string): MemberFavoriteItem[] {
  if (!canUseStorage()) {
    return []
  }

  const storedValue = window.localStorage.getItem(createMemberFavoriteStorageKey(userId))

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue) as MemberFavoriteItem[]
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    window.localStorage.removeItem(createMemberFavoriteStorageKey(userId))
    return []
  }
}

function writeStoredFavorites(userId: string, items: MemberFavoriteItem[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(createMemberFavoriteStorageKey(userId), JSON.stringify(items))
}

export function createBrowserMemberFavoriteRepository(): MemberFavoriteRepository {
  return {
    async countFavorites(userId) {
      return readStoredFavorites(userId).length
    },

    async getFavorites(userId) {
      return readStoredFavorites(userId)
    },

    async hasFavorite(userId, productId) {
      return readStoredFavorites(userId).some((item) => item.productId === productId)
    },

    async removeFavorite(userId, productId) {
      const nextItems = readStoredFavorites(userId).filter((item) => item.productId !== productId)
      writeStoredFavorites(userId, nextItems)
      return nextItems
    },

    async saveFavorite(userId, item) {
      const items = readStoredFavorites(userId).filter((candidate) => candidate.productId !== item.productId)
      const nextItems = [item, ...items]
      writeStoredFavorites(userId, nextItems)
      return nextItems
    },
  }
}
