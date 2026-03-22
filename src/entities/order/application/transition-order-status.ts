import type {
  OrderAction,
  OrderStatusUpdate,
  TransitionOrderStatusCommand,
} from '../domain/order'
import type { OrderRepository } from '../domain/order-repository'

export async function transitionOrderStatus(
  repository: OrderRepository,
  command: TransitionOrderStatusCommand,
): Promise<OrderStatusUpdate> {
  return repository.transitionStatus(command)
}

export async function cancelOrder(
  repository: OrderRepository,
  input: Omit<TransitionOrderStatusCommand, 'action'>,
) {
  return transitionOrderStatus(repository, {
    ...input,
    action: 'cancel',
  })
}

export async function payOrder(
  repository: OrderRepository,
  input: Omit<TransitionOrderStatusCommand, 'action'>,
) {
  return transitionOrderStatus(repository, {
    ...input,
    action: 'pay',
  })
}

export async function confirmOrderReceipt(
  repository: OrderRepository,
  input: Omit<TransitionOrderStatusCommand, 'action'>,
) {
  return transitionOrderStatus(repository, {
    ...input,
    action: 'confirm-receipt',
  })
}

export type { OrderAction }
