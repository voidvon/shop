import type { AddCartItemCommand, CartSnapshot } from './cart'

export interface CartRepository {
  addItem(command: AddCartItemCommand): Promise<CartSnapshot>
  getSnapshot(): Promise<CartSnapshot>
}
