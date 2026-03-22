import type { CartSnapshot } from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

export async function getSelectedCartSnapshot(
  repository: CartRepository,
): Promise<CartSnapshot> {
  return repository.getSelectedSnapshot()
}
