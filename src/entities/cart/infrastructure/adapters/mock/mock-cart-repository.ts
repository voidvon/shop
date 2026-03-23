import { createCartLine, createCartSnapshot, createEmptyCartSnapshot } from '../../../domain/cart'
import type { CartRepository } from '../../../domain/cart-repository'

import { mockProducts } from '@/shared/mocks/modules'

const initialProducts = mockProducts.slice(0, 2)

let cartLines = initialProducts.map((product, index) =>
  createCartLine({
    productId: product.productId,
    productImageUrl: product.imageUrl,
    productName: product.productName,
    quantity: index === 0 ? 1 : 2,
    unitPrice: product.price,
  }),
)
const selectedLineIds = new Set(cartLines.map((line) => line.lineId))

function createCurrentSnapshot() {
  return cartLines.length > 0 ? createCartSnapshot(cartLines) : createEmptyCartSnapshot()
}

function createSelectedSnapshot() {
  const selectedLines = cartLines.filter((line) => selectedLineIds.has(line.lineId))
  return selectedLines.length > 0 ? createCartSnapshot(selectedLines) : createEmptyCartSnapshot()
}

export const mockCartRepository: CartRepository = {
  async addItem(command) {
    const nextLine = createCartLine(command)
    const existingLine = cartLines.find((line) => line.lineId === nextLine.lineId)

    if (existingLine) {
      existingLine.quantity += command.quantity
      existingLine.lineTotal = existingLine.quantity * existingLine.unitPrice
    } else {
      cartLines = [...cartLines, nextLine]
    }

    selectedLineIds.add(nextLine.lineId)

    return Promise.resolve(createCurrentSnapshot())
  },

  async getSnapshot() {
    return Promise.resolve(createCurrentSnapshot())
  },

  async getSelectedSnapshot() {
    return Promise.resolve(createSelectedSnapshot())
  },

  async removeItem(lineId) {
    cartLines = cartLines.filter((line) => line.lineId !== lineId)
    selectedLineIds.delete(lineId)

    return Promise.resolve(createCurrentSnapshot())
  },

  async setItemQuantity({ lineId, quantity }) {
    cartLines = cartLines.map((line) =>
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
    )

    return Promise.resolve(createCurrentSnapshot())
  },

  async setItemsSelected({ lineIds, selected }) {
    const existingLineIds = new Set(cartLines.map((line) => line.lineId))

    lineIds.forEach((lineId) => {
      if (!existingLineIds.has(lineId)) {
        return
      }

      if (selected) {
        selectedLineIds.add(lineId)
        return
      }

      selectedLineIds.delete(lineId)
    })

    return Promise.resolve(createSelectedSnapshot())
  },
}
