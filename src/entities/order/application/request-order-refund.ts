import type {
  OrderRefundRequestResult,
  RequestOrderRefundCommand,
} from '../domain/order'
import type { OrderRepository } from '../domain/order-repository'

export async function requestOrderRefund(
  repository: OrderRepository,
  command: RequestOrderRefundCommand,
): Promise<OrderRefundRequestResult> {
  return repository.requestRefund(command)
}
