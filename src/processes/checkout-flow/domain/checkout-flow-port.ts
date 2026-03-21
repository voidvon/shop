import type { CheckoutPreview, OrderConfirmation } from '@/entities/order'

export interface SubmitCheckoutOrderResult {
  confirmation: OrderConfirmation
  preview: CheckoutPreview
}

export interface CheckoutFlowPort {
  getPreview(): Promise<CheckoutPreview>
  submit(): Promise<SubmitCheckoutOrderResult>
}
