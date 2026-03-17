export { addCartItem } from './application/add-cart-item'
export { getCartSnapshot } from './application/get-cart-snapshot'
export {
  createEmptyCartSnapshot,
  createCartSnapshot,
  type AddCartItemCommand,
  type CartLine,
  type CartSnapshot,
} from './domain/cart'
export type { CartRepository } from './domain/cart-repository'
export { backendACartRepository } from './infrastructure/adapters/backend-a/backend-a-cart-repository'
export { mockCartRepository } from './infrastructure/adapters/mock/mock-cart-repository'
export { provideCartRepository, useCartRepository } from './infrastructure/cart-repository-provider'
