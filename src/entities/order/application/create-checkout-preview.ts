import type { CheckoutCouponUsage, CheckoutPreview, CreateCheckoutPreviewCommand } from '../domain/order'
import type { OrderRepository } from '../domain/order-repository'

export async function createCheckoutPreviewUseCase(
  repository: OrderRepository,
  command: CreateCheckoutPreviewCommand,
  couponUsages?: CheckoutCouponUsage[],
): Promise<CheckoutPreview> {
  return repository.createPreview(command, couponUsages)
}
