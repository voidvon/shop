import type { CheckoutPreview, CreateCheckoutPreviewCommand } from '../domain/order'
import type { OrderRepository } from '../domain/order-repository'

export async function createCheckoutPreviewUseCase(
  repository: OrderRepository,
  command: CreateCheckoutPreviewCommand,
): Promise<CheckoutPreview> {
  return repository.createPreview(command)
}
