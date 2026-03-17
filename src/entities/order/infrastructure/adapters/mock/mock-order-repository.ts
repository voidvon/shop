import {
  createCheckoutPreview,
  type CreateCheckoutPreviewCommand,
  type OrderConfirmation,
} from '../../../domain/order'
import type { OrderRepository } from '../../../domain/order-repository'

function createConfirmation(command: CreateCheckoutPreviewCommand): OrderConfirmation {
  const preview = createCheckoutPreview(command)

  return {
    orderId: `mock-${Date.now()}`,
    payableAmount: preview.payableAmount,
    source: command.source,
    submittedAt: new Date().toISOString(),
  }
}

export const mockOrderRepository: OrderRepository = {
  async createPreview(command) {
    return Promise.resolve(createCheckoutPreview(command))
  },

  async submit(command) {
    return Promise.resolve(createConfirmation(command))
  },
}
