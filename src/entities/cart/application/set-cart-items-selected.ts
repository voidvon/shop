import type { CartSnapshot, SetCartItemsSelectedCommand } from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

export async function setCartItemsSelected(
  repository: CartRepository,
  command: SetCartItemsSelectedCommand,
): Promise<CartSnapshot> {
  return repository.setItemsSelected(command)
}
