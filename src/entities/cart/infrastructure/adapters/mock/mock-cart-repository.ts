import { createCartLine, createCartSnapshot, createEmptyCartSnapshot } from '../../../domain/cart'
import type { CartRepository } from '../../../domain/cart-repository'

let cartLines = [createCartLine({
  productId: 'sku-ceramic-cup',
  productName: '手冲陶瓷分享杯',
  quantity: 1,
  unitPrice: 89,
})]

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
