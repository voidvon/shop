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
const selectedProductIds = new Set(cartLines.map((line) => line.productId))

function createCurrentSnapshot() {
  return cartLines.length > 0 ? createCartSnapshot(cartLines) : createEmptyCartSnapshot()
}

function createSelectedSnapshot() {
  const selectedLines = cartLines.filter((line) => selectedProductIds.has(line.productId))
  return selectedLines.length > 0 ? createCartSnapshot(selectedLines) : createEmptyCartSnapshot()
}

export const mockCartRepository: CartRepository = {
  async addItem(command) {
    const existingLine = cartLines.find((line) => line.productId === command.productId)

    if (existingLine) {
      existingLine.quantity += command.quantity
      existingLine.lineTotal = existingLine.quantity * existingLine.unitPrice
    } else {
      cartLines = [...cartLines, createCartLine(command)]
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
    cartLines = cartLines.filter((line) => line.productId !== productId)
    selectedProductIds.delete(productId)

    return Promise.resolve(createCurrentSnapshot())
  },

  async setItemQuantity({ productId, quantity }) {
    cartLines = cartLines.map((line) =>
      line.productId === productId
        ? createCartLine({
            productId: line.productId,
            productImageUrl: line.productImageUrl ?? null,
            productName: line.productName,
            quantity,
            unitPrice: line.unitPrice,
          })
        : line,
    )

    return Promise.resolve(createCurrentSnapshot())
  },

  async setItemsSelected({ productIds, selected }) {
    const existingProductIds = new Set(cartLines.map((line) => line.productId))

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
