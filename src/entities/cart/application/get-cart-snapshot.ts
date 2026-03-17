import type { CartSnapshot } from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

export async function getCartSnapshot(repository: CartRepository): Promise<CartSnapshot> {
  return repository.getSnapshot()
}
