import {
  createCheckoutPreview,
  type CreateCheckoutPreviewCommand,
  type OrderConfirmation,
} from '../../../domain/order'
import type { OrderRepository } from '../../../domain/order-repository'

function resolveDiscount(command: CreateCheckoutPreviewCommand) {
  const subtotal = command.lines.reduce((sum, line) => sum + line.lineTotal, 0)
  return command.source === 'cart' ? Math.round(subtotal * 0.08) : Math.round(subtotal * 0.05)
}

function createConfirmation(command: CreateCheckoutPreviewCommand): OrderConfirmation {
  const preview = createCheckoutPreview(command, resolveDiscount(command))

  return {
    orderId: `backend-a-${Date.now()}`,
    payableAmount: preview.payableAmount,
    source: command.source,
    submittedAt: new Date().toISOString(),
  }
}

export const backendAOrderRepository: OrderRepository = {
  async createPreview(command) {
    return Promise.resolve(createCheckoutPreview(command, resolveDiscount(command)))
  },

  async submit(command) {
    return Promise.resolve(createConfirmation(command))
  },
}
