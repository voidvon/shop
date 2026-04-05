import type { CheckoutCouponUsage, CheckoutPreview, OrderConfirmation } from '@/entities/order'

export interface SubmitCheckoutOrderCommand {
  addressId?: string | null
  couponUsages?: CheckoutCouponUsage[]
  remark?: string | null
}

export interface SubmitCheckoutOrderResult {
  confirmation: OrderConfirmation
  preview: CheckoutPreview
}

export interface CheckoutFlowPort {
  getPreview(couponUsages?: CheckoutCouponUsage[]): Promise<CheckoutPreview>
  submit(command?: SubmitCheckoutOrderCommand): Promise<SubmitCheckoutOrderResult>
}
