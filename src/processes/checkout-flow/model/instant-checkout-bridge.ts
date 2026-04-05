interface InstantCheckoutBridgeLineSnapshot {
  lineId: string
  productId: string
  productImageUrl?: string | null
  productName: string
  quantity: number
  skuId: string | null
  specText: string | null
  unitPrice: number
}

export interface InstantCheckoutBridgeState {
  lineId: string
  previousLine: InstantCheckoutBridgeLineSnapshot | null
  previousQuantity: number | null
  previousSelectedLineIds: string[]
  source: 'instant'
}

const instantCheckoutBridgeStorageKey = 'shop.instant-checkout-bridge'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function normalizeBridgeState(value: unknown): InstantCheckoutBridgeState | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<InstantCheckoutBridgeState>

  if (
    candidate.source !== 'instant'
    || typeof candidate.lineId !== 'string'
    || !candidate.lineId.trim()
    || (candidate.previousLine !== null
      && candidate.previousLine !== undefined
      && (
        typeof candidate.previousLine !== 'object'
        || typeof candidate.previousLine.lineId !== 'string'
        || typeof candidate.previousLine.productId !== 'string'
        || typeof candidate.previousLine.productName !== 'string'
        || typeof candidate.previousLine.quantity !== 'number'
        || (candidate.previousLine.productImageUrl !== null
          && candidate.previousLine.productImageUrl !== undefined
          && typeof candidate.previousLine.productImageUrl !== 'string')
        || (candidate.previousLine.skuId !== null
          && candidate.previousLine.skuId !== undefined
          && typeof candidate.previousLine.skuId !== 'string')
        || (candidate.previousLine.specText !== null
          && candidate.previousLine.specText !== undefined
          && typeof candidate.previousLine.specText !== 'string')
        || typeof candidate.previousLine.unitPrice !== 'number'
      ))
    || (candidate.previousQuantity !== null
      && candidate.previousQuantity !== undefined
      && typeof candidate.previousQuantity !== 'number')
    || !Array.isArray(candidate.previousSelectedLineIds)
  ) {
    return null
  }

  return {
    lineId: candidate.lineId,
    previousLine: candidate.previousLine
      ? {
          lineId: candidate.previousLine.lineId,
          productId: candidate.previousLine.productId,
          productImageUrl: candidate.previousLine.productImageUrl ?? null,
          productName: candidate.previousLine.productName,
          quantity: candidate.previousLine.quantity,
          skuId: candidate.previousLine.skuId ?? null,
          specText: candidate.previousLine.specText ?? null,
          unitPrice: candidate.previousLine.unitPrice,
        }
      : null,
    previousQuantity: typeof candidate.previousQuantity === 'number' ? candidate.previousQuantity : null,
    previousSelectedLineIds: candidate.previousSelectedLineIds.filter(
      (lineId): lineId is string => typeof lineId === 'string' && lineId.trim().length > 0,
    ),
    source: 'instant',
  }
}

export function readInstantCheckoutBridge() {
  if (!canUseStorage()) {
    return null
  }

  const storedValue = window.sessionStorage.getItem(instantCheckoutBridgeStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    return normalizeBridgeState(JSON.parse(storedValue))
  } catch {
    window.sessionStorage.removeItem(instantCheckoutBridgeStorageKey)
    return null
  }
}

export function writeInstantCheckoutBridge(state: InstantCheckoutBridgeState) {
  if (!canUseStorage()) {
    return
  }

  window.sessionStorage.setItem(instantCheckoutBridgeStorageKey, JSON.stringify(state))
}

export function clearInstantCheckoutBridge() {
  if (!canUseStorage()) {
    return
  }

  window.sessionStorage.removeItem(instantCheckoutBridgeStorageKey)
}
