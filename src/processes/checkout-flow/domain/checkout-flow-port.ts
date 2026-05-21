import type {
  CheckoutCouponUsage,
  CheckoutPreview,
  CheckoutVirtualAccountInput,
  OrderConfirmation,
} from '@/entities/order'

export interface SubmitCheckoutOrderCommand {
  addressId?: string | null
  couponUsages?: CheckoutCouponUsage[]
  lineIds?: string[]
  remark?: string | null
  source?: 'cart' | 'instant'
  virtualAccountInputs?: CheckoutVirtualAccountInput[]
}

export interface GetCheckoutPreviewOptions {
  addressId?: string | null
  couponUsages?: CheckoutCouponUsage[]
  lineIds?: string[]
  source?: 'cart' | 'instant'
  virtualAccountInputs?: CheckoutVirtualAccountInput[]
}

export interface SubmitCheckoutOrderResult {
  confirmation: OrderConfirmation
  preview: CheckoutPreview
}

export interface CheckoutFlowPort {
  getPreview(options?: GetCheckoutPreviewOptions): Promise<CheckoutPreview>
  submit(command?: SubmitCheckoutOrderCommand): Promise<SubmitCheckoutOrderResult>
}
