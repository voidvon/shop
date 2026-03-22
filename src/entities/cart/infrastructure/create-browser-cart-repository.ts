import {
  createCartLine,
  createCartSnapshot,
  createEmptyCartSnapshot,
  type CartLine,
} from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

interface StoredCartState {
  lines: CartLine[]
  selectedProductIds: string[]
}

const cartStorageKey = 'shop.cart'

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
    || typeof candidate.productName !== 'string'
    || typeof candidate.quantity !== 'number'
    || typeof candidate.unitPrice !== 'number'
  ) {
    return null
  }

  return createCartLine({
    productId: candidate.productId,
    productName: candidate.productName,
    quantity: candidate.quantity,
    unitPrice: candidate.unitPrice,
  })
}

function readStoredCartState(): StoredCartState {
  if (!canUseStorage()) {
    return {
      lines: [],
      selectedProductIds: [],
    }
  }

  const storedValue = window.localStorage.getItem(cartStorageKey)

  if (!storedValue) {
    return {
      lines: [],
      selectedProductIds: [],
    }
  }

  try {
    const parsedValue = JSON.parse(storedValue) as {
      lines?: unknown
      selectedProductIds?: unknown
    }

    const lines = Array.isArray(parsedValue.lines)
      ? parsedValue.lines
          .map(normalizeStoredCartLine)
          .filter((line): line is CartLine => Boolean(line))
      : []
    const existingProductIds = new Set(lines.map((line) => line.productId))
    const selectedProductIds = Array.isArray(parsedValue.selectedProductIds)
      ? parsedValue.selectedProductIds
          .filter((productId): productId is string => typeof productId === 'string')
          .filter((productId) => existingProductIds.has(productId))
      : lines.map((line) => line.productId)

    return {
      lines,
      selectedProductIds,
    }
  } catch {
    window.localStorage.removeItem(cartStorageKey)
    return {
      lines: [],
      selectedProductIds: [],
    }
  }
}

function writeStoredCartState(state: StoredCartState) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(cartStorageKey, JSON.stringify(state))
}

function createSnapshot(lines: CartLine[]) {
  return lines.length > 0 ? createCartSnapshot(lines) : createEmptyCartSnapshot()
}

function createSelectedSnapshot(state: StoredCartState) {
  const selectedProductIds = new Set(state.selectedProductIds)
  const selectedLines = state.lines.filter((line) => selectedProductIds.has(line.productId))
  return createSnapshot(selectedLines)
}

export function createBrowserCartRepository(): CartRepository {
  return {
    async addItem(command) {
      const state = readStoredCartState()
      const existingLine = state.lines.find((line) => line.productId === command.productId)

      if (existingLine) {
        existingLine.quantity += command.quantity
        existingLine.lineTotal = existingLine.quantity * existingLine.unitPrice
      } else {
        state.lines = [...state.lines, createCartLine(command)]
      }

      if (!state.selectedProductIds.includes(command.productId)) {
        state.selectedProductIds = [...state.selectedProductIds, command.productId]
      }

      writeStoredCartState(state)

      return createSnapshot(state.lines)
    },

    async getSnapshot() {
      const state = readStoredCartState()
      return createSnapshot(state.lines)
    },

    async getSelectedSnapshot() {
      const state = readStoredCartState()
      return createSelectedSnapshot(state)
    },

    async removeItem(productId) {
      const state = readStoredCartState()
      const nextState = {
        lines: state.lines.filter((line) => line.productId !== productId),
        selectedProductIds: state.selectedProductIds.filter((selectedId) => selectedId !== productId),
      }

      writeStoredCartState(nextState)

      return createSnapshot(nextState.lines)
    },

    async setItemQuantity({ productId, quantity }) {
      const state = readStoredCartState()
      const nextState = {
        ...state,
        lines: state.lines.map((line) =>
          line.productId === productId
            ? createCartLine({
                productId: line.productId,
                productName: line.productName,
                quantity,
                unitPrice: line.unitPrice,
              })
            : line,
        ),
      }

      writeStoredCartState(nextState)

      return createSnapshot(nextState.lines)
    },

    async setItemsSelected({ productIds, selected }) {
      const state = readStoredCartState()
      const existingProductIds = new Set(state.lines.map((line) => line.productId))
      const nextSelectedProductIds = new Set(state.selectedProductIds)

      productIds.forEach((productId) => {
        if (!existingProductIds.has(productId)) {
          return
        }

        if (selected) {
          nextSelectedProductIds.add(productId)
          return
        }

        nextSelectedProductIds.delete(productId)
      })

      const nextState = {
        ...state,
        selectedProductIds: [...nextSelectedProductIds],
      }

      writeStoredCartState(nextState)

      return createSelectedSnapshot(nextState)
    },
  }
}
