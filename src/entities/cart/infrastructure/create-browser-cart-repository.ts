import {
  createCartLine,
  createCartSnapshot,
  createEmptyCartSnapshot,
  type CartLine,
} from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

interface StoredCartState {
  lines: CartLine[]
  selectedLineIds: string[]
}

interface CreateBrowserCartRepositoryOptions {
  getScopeKey?: () => string
}

const cartStoragePrefix = 'shop.cart'
const legacyCartStorageKey = 'shop.cart'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function normalizeStoredCartLine(value: unknown): CartLine | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<CartLine>

  if (
    typeof candidate.productId !== 'string'
    || (candidate.skuId !== null && candidate.skuId !== undefined && typeof candidate.skuId !== 'string')
    || (candidate.specText !== null && candidate.specText !== undefined && typeof candidate.specText !== 'string')
    || typeof candidate.productName !== 'string'
    || typeof candidate.quantity !== 'number'
    || typeof candidate.unitPrice !== 'number'
  ) {
    return null
  }

  return createCartLine({
    productId: candidate.productId,
    productImageUrl: candidate.productImageUrl ?? null,
    productName: candidate.productName,
    quantity: candidate.quantity,
    skuId: candidate.skuId ?? null,
    specText: candidate.specText ?? null,
    unitPrice: candidate.unitPrice,
  })
}

function createCartStorageKey(scopeKey: string) {
  return `${cartStoragePrefix}.${scopeKey}`
}

function createEmptyStoredCartState(): StoredCartState {
  return {
    lines: [],
    selectedLineIds: [],
  }
}

function parseStoredCartState(storedValue: string | null, storageKey: string): StoredCartState {
  if (!storedValue) {
    return createEmptyStoredCartState()
  }

  try {
    const parsedValue = JSON.parse(storedValue) as {
      lines?: unknown
      selectedProductIds?: unknown
      selectedLineIds?: unknown
    }

    const lines = Array.isArray(parsedValue.lines)
      ? parsedValue.lines
          .map(normalizeStoredCartLine)
          .filter((line): line is CartLine => Boolean(line))
      : []
    const existingLineIds = new Set(lines.map((line) => line.lineId))
    const selectedLineIds = Array.isArray(parsedValue.selectedLineIds)
      ? parsedValue.selectedLineIds
          .filter((lineId): lineId is string => typeof lineId === 'string')
          .filter((lineId) => existingLineIds.has(lineId))
      : Array.isArray(parsedValue.selectedProductIds)
        ? parsedValue.selectedProductIds
            .filter((lineId): lineId is string => typeof lineId === 'string')
            .filter((lineId) => existingLineIds.has(lineId))
      : lines.map((line) => line.lineId)

    return {
      lines,
      selectedLineIds,
    }
  } catch {
    window.localStorage.removeItem(storageKey)
    return createEmptyStoredCartState()
  }
}

function readStoredCartState(scopeKey: string): StoredCartState {
  if (!canUseStorage()) {
    return createEmptyStoredCartState()
  }

  const storageKey = createCartStorageKey(scopeKey)
  const storedValue = window.localStorage.getItem(storageKey)

  if (storedValue) {
    return parseStoredCartState(storedValue, storageKey)
  }

  if (scopeKey === 'guest') {
    const legacyStoredValue = window.localStorage.getItem(legacyCartStorageKey)

    if (!legacyStoredValue) {
      return createEmptyStoredCartState()
    }

    const legacyState = parseStoredCartState(legacyStoredValue, legacyCartStorageKey)
    window.localStorage.setItem(storageKey, JSON.stringify(legacyState))
    window.localStorage.removeItem(legacyCartStorageKey)
    return legacyState
  }

  return createEmptyStoredCartState()
}

function writeStoredCartState(scopeKey: string, state: StoredCartState) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(createCartStorageKey(scopeKey), JSON.stringify(state))
}

function createSnapshot(lines: CartLine[]) {
  return lines.length > 0 ? createCartSnapshot(lines) : createEmptyCartSnapshot()
}

function createSelectedSnapshot(state: StoredCartState) {
  const selectedLineIds = new Set(state.selectedLineIds)
  const selectedLines = state.lines.filter((line) => selectedLineIds.has(line.lineId))
  return createSnapshot(selectedLines)
}

export function createBrowserCartRepository(options: CreateBrowserCartRepositoryOptions = {}): CartRepository {
  function resolveScopeKey() {
    return options.getScopeKey?.() ?? 'guest'
  }

  return {
    async addItem(command) {
      const scopeKey = resolveScopeKey()
      const state = readStoredCartState(scopeKey)
      const nextLine = createCartLine(command)
      const existingLine = state.lines.find((line) => line.lineId === nextLine.lineId)

      if (existingLine) {
        existingLine.quantity += command.quantity
        existingLine.lineTotal = existingLine.quantity * existingLine.unitPrice
      } else {
        state.lines = [...state.lines, nextLine]
      }

      if (!state.selectedLineIds.includes(nextLine.lineId)) {
        state.selectedLineIds = [...state.selectedLineIds, nextLine.lineId]
      }

      writeStoredCartState(scopeKey, state)

      return createSnapshot(state.lines)
    },

    async getSnapshot() {
      const state = readStoredCartState(resolveScopeKey())
      return createSnapshot(state.lines)
    },

    async getSelectedSnapshot() {
      const state = readStoredCartState(resolveScopeKey())
      return createSelectedSnapshot(state)
    },

    async removeItem(lineId) {
      const scopeKey = resolveScopeKey()
      const state = readStoredCartState(scopeKey)
      const nextState = {
        lines: state.lines.filter((line) => line.lineId !== lineId),
        selectedLineIds: state.selectedLineIds.filter((selectedId) => selectedId !== lineId),
      }

      writeStoredCartState(scopeKey, nextState)

      return createSnapshot(nextState.lines)
    },

    async setItemQuantity({ lineId, quantity }) {
      const scopeKey = resolveScopeKey()
      const state = readStoredCartState(scopeKey)
      const nextState = {
        ...state,
        lines: state.lines.map((line) =>
          line.lineId === lineId
            ? createCartLine({
                productId: line.productId,
                productImageUrl: line.productImageUrl ?? null,
                productName: line.productName,
                quantity,
                skuId: line.skuId,
                specText: line.specText,
                unitPrice: line.unitPrice,
              })
            : line,
        ),
      }

      writeStoredCartState(scopeKey, nextState)

      return createSnapshot(nextState.lines)
    },

    async setItemsSelected({ lineIds, selected }) {
      const scopeKey = resolveScopeKey()
      const state = readStoredCartState(scopeKey)
      const existingLineIds = new Set(state.lines.map((line) => line.lineId))
      const nextSelectedLineIds = new Set(state.selectedLineIds)

      lineIds.forEach((lineId) => {
        if (!existingLineIds.has(lineId)) {
          return
        }

        if (selected) {
          nextSelectedLineIds.add(lineId)
          return
        }

        nextSelectedLineIds.delete(lineId)
      })

      const nextState = {
        ...state,
        selectedLineIds: [...nextSelectedLineIds],
      }

      writeStoredCartState(scopeKey, nextState)

      return createSelectedSnapshot(nextState)
    },
  }
}
