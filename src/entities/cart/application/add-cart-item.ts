import type { AddCartItemCommand, CartSnapshot } from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

export async function addCartItem(
  repository: CartRepository,
  command: AddCartItemCommand,
): Promise<CartSnapshot> {
  return repository.addItem(command)
}
