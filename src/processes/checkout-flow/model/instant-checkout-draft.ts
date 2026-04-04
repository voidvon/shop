import type { CheckoutLine } from '@/entities/order'

export interface InstantCheckoutDraft {
  lines: CheckoutLine[]
  source: 'instant'
}

export const simulatedInstantOrderNamespace = 'backend-a-instant'

const instantCheckoutDraftStorageKey = 'shop.instant-checkout-draft'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function readInstantCheckoutDraft(): InstantCheckoutDraft | null {
  if (!canUseStorage()) {
    return null
  }

  const storedValue = window.sessionStorage.getItem(instantCheckoutDraftStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue) as InstantCheckoutDraft

    if (
      !parsedValue
      || parsedValue.source !== 'instant'
      || !Array.isArray(parsedValue.lines)
      || parsedValue.lines.length === 0
    ) {
      return null
    }

    return parsedValue
  } catch {
    window.sessionStorage.removeItem(instantCheckoutDraftStorageKey)
    return null
  }
}

export function writeInstantCheckoutDraft(draft: InstantCheckoutDraft) {
  if (!canUseStorage()) {
    return
  }

  window.sessionStorage.setItem(instantCheckoutDraftStorageKey, JSON.stringify(draft))
}

export function clearInstantCheckoutDraft() {
  if (!canUseStorage()) {
    return
  }

  window.sessionStorage.removeItem(instantCheckoutDraftStorageKey)
}
