export interface PendingMemberFavoriteIntent {
  productId: string
  redirectPath: string
}

const pendingMemberFavoriteIntentStorageKey = 'shop.pending-member-favorite-intent'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function readPendingMemberFavoriteIntent(): PendingMemberFavoriteIntent | null {
  if (!canUseStorage()) {
    return null
  }

  const storedValue = window.sessionStorage.getItem(pendingMemberFavoriteIntentStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    return JSON.parse(storedValue) as PendingMemberFavoriteIntent
  } catch {
    window.sessionStorage.removeItem(pendingMemberFavoriteIntentStorageKey)
    return null
  }
}

export function savePendingMemberFavoriteIntent(intent: PendingMemberFavoriteIntent) {
  if (!canUseStorage()) {
    return
  }

  window.sessionStorage.setItem(
    pendingMemberFavoriteIntentStorageKey,
    JSON.stringify(intent),
  )
}

export function clearPendingMemberFavoriteIntent() {
  if (!canUseStorage()) {
    return
  }

  window.sessionStorage.removeItem(pendingMemberFavoriteIntentStorageKey)
}
