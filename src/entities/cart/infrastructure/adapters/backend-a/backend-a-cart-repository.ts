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

export const backendACartRepository: CartRepository = {
  async addItem(command) {
    const existingEntry = backendACartEntries.find((entry) => entry.sku === command.productId)

    if (existingEntry) {
      existingEntry.qty += command.quantity
    } else {
      backendACartEntries = [...backendACartEntries, createEntry(command)]
    }

    return Promise.resolve(mapBackendACartSnapshotDto(createSnapshotDto(backendACartEntries)))
  },

  async getSnapshot() {
    if (backendACartEntries.length === 0) {
      return Promise.resolve(createEmptyCartSnapshot())
    }

    return Promise.resolve(mapBackendACartSnapshotDto(createSnapshotDto(backendACartEntries)))
  },
}
