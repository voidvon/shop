import type { CartSnapshot, SetCartItemQuantityCommand } from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

export async function setCartItemQuantity(
  repository: CartRepository,
  command: SetCartItemQuantityCommand,
): Promise<CartSnapshot> {
  return repository.setItemQuantity(command)
}
