import { createEmptyCartSnapshot, type AddCartItemCommand } from '../../../domain/cart'
import type { CartRepository } from '../../../domain/cart-repository'
import type { BackendACartLineDto, BackendACartSnapshotDto } from '../../dto/backend-a-cart.dto'
import { mapBackendACartSnapshotDto } from '../../mappers/cart-dto-mapper'

let backendACartEntries: BackendACartLineDto[] = [
  {
    qty: 2,
    sku: 'backend-a-speaker',
    title: '织面桌面蓝牙音箱',
    unitAmount: 379,
  },
]
const selectedProductIds = new Set(backendACartEntries.map((entry) => entry.sku))

function createSnapshotDto(entries: BackendACartLineDto[]): BackendACartSnapshotDto {
  return {
    entries,
    payableAmount: entries.reduce((sum, entry) => sum + entry.qty * entry.unitAmount, 0),
    totalUnits: entries.reduce((sum, entry) => sum + entry.qty, 0),
  }
}

function createEntry(command: AddCartItemCommand): BackendACartLineDto {
  return {
    qty: command.quantity,
    sku: command.productId,
    title: command.productName,
    unitAmount: command.unitPrice,
  }
}

function createCurrentSnapshot() {
  if (backendACartEntries.length === 0) {
    return createEmptyCartSnapshot()
  }

  return mapBackendACartSnapshotDto(createSnapshotDto(backendACartEntries))
}

function createSelectedSnapshot() {
  const selectedEntries = backendACartEntries.filter((entry) => selectedProductIds.has(entry.sku))

  if (selectedEntries.length === 0) {
    return createEmptyCartSnapshot()
  }

  return mapBackendACartSnapshotDto(createSnapshotDto(selectedEntries))
}

export const backendACartRepository: CartRepository = {
  async addItem(command) {
    const existingEntry = backendACartEntries.find((entry) => entry.sku === command.productId)

    if (existingEntry) {
      existingEntry.qty += command.quantity
    } else {
      backendACartEntries = [...backendACartEntries, createEntry(command)]
    }

    selectedProductIds.add(command.productId)

    return Promise.resolve(createCurrentSnapshot())
  },

  async getSnapshot() {
    return Promise.resolve(createCurrentSnapshot())
  },

  async getSelectedSnapshot() {
    return Promise.resolve(createSelectedSnapshot())
  },

  async removeItem(productId) {
    backendACartEntries = backendACartEntries.filter((entry) => entry.sku !== productId)
    selectedProductIds.delete(productId)

    return Promise.resolve(createCurrentSnapshot())
  },

  async setItemQuantity({ productId, quantity }) {
    backendACartEntries = backendACartEntries.map((entry) =>
      entry.sku === productId
        ? {
            ...entry,
            qty: Math.max(1, Math.floor(quantity)),
          }
        : entry,
    )

    return Promise.resolve(createCurrentSnapshot())
  },

  async setItemsSelected({ productIds, selected }) {
    const existingProductIds = new Set(backendACartEntries.map((entry) => entry.sku))

    productIds.forEach((productId) => {
      if (!existingProductIds.has(productId)) {
        return
      }

      if (selected) {
        selectedProductIds.add(productId)
        return
      }

      selectedProductIds.delete(productId)
    })

    return Promise.resolve(createSelectedSnapshot())
  },
}
