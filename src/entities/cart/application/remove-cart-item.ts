import type { CartSnapshot } from '../domain/cart'
import type { CartRepository } from '../domain/cart-repository'

export async function removeCartItem(
  repository: CartRepository,
  productId: string,
): Promise<CartSnapshot> {
  return repository.removeItem(productId)
}
