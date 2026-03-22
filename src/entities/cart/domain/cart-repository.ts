import type {
  AddCartItemCommand,
  CartSnapshot,
  SetCartItemQuantityCommand,
  SetCartItemsSelectedCommand,
} from './cart'

export interface CartRepository {
  addItem(command: AddCartItemCommand): Promise<CartSnapshot>
  getSnapshot(): Promise<CartSnapshot>
  getSelectedSnapshot(): Promise<CartSnapshot>
  removeItem(productId: string): Promise<CartSnapshot>
  setItemQuantity(command: SetCartItemQuantityCommand): Promise<CartSnapshot>
  setItemsSelected(command: SetCartItemsSelectedCommand): Promise<CartSnapshot>
}
