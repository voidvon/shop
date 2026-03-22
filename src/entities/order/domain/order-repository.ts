import type {
  CheckoutPreview,
  CreateCheckoutPreviewCommand,
  OrderConfirmation,
  OrderStatusUpdate,
  SubmitOrderCommand,
  TransitionOrderStatusCommand,
} from './order'

export interface OrderRepository {
  createPreview(command: CreateCheckoutPreviewCommand): Promise<CheckoutPreview>
  submit(command: SubmitOrderCommand): Promise<OrderConfirmation>
  transitionStatus(command: TransitionOrderStatusCommand): Promise<OrderStatusUpdate>
}
