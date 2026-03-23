import type { CheckoutPreview, OrderConfirmation } from '@/entities/order'

export interface SubmitCheckoutOrderCommand {
  addressId?: string | null
  remark?: string | null
}

export interface SubmitCheckoutOrderResult {
  confirmation: OrderConfirmation
  preview: CheckoutPreview
}

export interface CheckoutFlowPort {
  getPreview(): Promise<CheckoutPreview>
  submit(command?: SubmitCheckoutOrderCommand): Promise<SubmitCheckoutOrderResult>
}
