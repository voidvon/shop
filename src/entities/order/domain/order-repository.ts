import type {
  CheckoutPreview,
  CreateCheckoutPreviewCommand,
  OrderConfirmation,
  SubmitOrderCommand,
} from './order'

export interface OrderRepository {
  createPreview(command: CreateCheckoutPreviewCommand): Promise<CheckoutPreview>
  submit(command: SubmitOrderCommand): Promise<OrderConfirmation>
}
