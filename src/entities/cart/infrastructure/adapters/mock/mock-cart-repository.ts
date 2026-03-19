import { createCartLine, createCartSnapshot, createEmptyCartSnapshot } from '../../../domain/cart'
import type { CartRepository } from '../../../domain/cart-repository'

import { mockProducts } from '@/shared/mocks/modules'

const initialProducts = mockProducts.slice(0, 2)

let cartLines = initialProducts.map((product, index) =>
  createCartLine({
    productId: product.productId,
    productName: product.productName,
    quantity: index === 0 ? 1 : 2,
    unitPrice: product.price,
  }),
)

export const mockCartRepository: CartRepository = {
  async addItem(command) {
    const existingLine = cartLines.find((line) => line.productId === command.productId)

    if (existingLine) {
      existingLine.quantity += command.quantity
      existingLine.lineTotal = existingLine.quantity * existingLine.unitPrice
    } else {
      cartLines = [...cartLines, createCartLine(command)]
    }

    return Promise.resolve(createCartSnapshot(cartLines))
  },

  async getSnapshot() {
    return Promise.resolve(
      cartLines.length > 0 ? createCartSnapshot(cartLines) : createEmptyCartSnapshot(),
    )
  },
}
