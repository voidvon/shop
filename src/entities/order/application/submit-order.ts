import type { OrderConfirmation, SubmitOrderCommand } from '../domain/order'
import type { OrderRepository } from '../domain/order-repository'

export async function submitOrder(
  repository: OrderRepository,
  command: SubmitOrderCommand,
): Promise<OrderConfirmation> {
  return repository.submit(command)
}
