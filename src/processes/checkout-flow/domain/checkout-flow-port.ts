import type { CheckoutCouponUsage, CheckoutPreview, OrderConfirmation } from '@/entities/order'

export interface SubmitCheckoutOrderCommand {
  addressId?: string | null
  couponUsages?: CheckoutCouponUsage[]
  remark?: string | null
}

export interface GetCheckoutPreviewOptions {
  addressId?: string | null
  couponUsages?: CheckoutCouponUsage[]
}

export interface SubmitCheckoutOrderResult {
  confirmation: OrderConfirmation
  preview: CheckoutPreview
}

export interface CheckoutFlowPort {
  getPreview(options?: GetCheckoutPreviewOptions): Promise<CheckoutPreview>
  submit(command?: SubmitCheckoutOrderCommand): Promise<SubmitCheckoutOrderResult>
}
