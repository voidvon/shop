import type {
  CheckoutCouponUsage,
  CheckoutPreview,
  CreateCheckoutPreviewCommand,
  OrderConfirmation,
  OrderStatusUpdate,
  SubmitOrderCommand,
  TransitionOrderStatusCommand,
} from './order'

export interface OrderRepository {
  createPreview(command: CreateCheckoutPreviewCommand, couponUsages?: CheckoutCouponUsage[]): Promise<CheckoutPreview>
  submit(command: SubmitOrderCommand): Promise<OrderConfirmation>
  transitionStatus(command: TransitionOrderStatusCommand): Promise<OrderStatusUpdate>
}
