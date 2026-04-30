import type {
  CheckoutCouponUsage,
  CheckoutPreview,
  CreateCheckoutPreviewCommand,
  OrderConfirmation,
  OrderRefundRequestResult,
  OrderStatusUpdate,
  RequestOrderRefundCommand,
  SubmitOrderCommand,
  TransitionOrderStatusCommand,
} from './order'

export interface OrderRepository {
  createPreview(command: CreateCheckoutPreviewCommand, couponUsages?: CheckoutCouponUsage[]): Promise<CheckoutPreview>
  requestRefund(command: RequestOrderRefundCommand): Promise<OrderRefundRequestResult>
  submit(command: SubmitOrderCommand): Promise<OrderConfirmation>
  transitionStatus(command: TransitionOrderStatusCommand): Promise<OrderStatusUpdate>
}
