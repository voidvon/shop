export { addCartItem } from './application/add-cart-item'
export { getCartSnapshot } from './application/get-cart-snapshot'
export { getSelectedCartSnapshot } from './application/get-selected-cart-snapshot'
export { removeCartItem } from './application/remove-cart-item'
export { setCartItemsSelected } from './application/set-cart-items-selected'
export { setCartItemQuantity } from './application/set-cart-item-quantity'
export {
  createEmptyCartSnapshot,
  createCartSnapshot,
  type AddCartItemCommand,
  type CartLine,
  type CartSnapshot,
  type SetCartItemQuantityCommand,
  type SetCartItemsSelectedCommand,
} from './domain/cart'
export type { CartRepository } from './domain/cart-repository'
export { createBackendACartRepository } from './infrastructure/adapters/backend-a/backend-a-cart-repository'
export { mockCartRepository } from './infrastructure/adapters/mock/mock-cart-repository'
export { createBrowserCartRepository } from './infrastructure/create-browser-cart-repository'
export { provideCartRepository, useCartRepository } from './infrastructure/cart-repository-provider'
