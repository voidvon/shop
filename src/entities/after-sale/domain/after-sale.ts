import type { ReturnShipmentInfo } from '@/shared/types/modules'

export type AfterSaleApplicationType = 'refund' | 'return'

export interface AfterSaleRecord {
  refundId: string
  type: AfterSaleApplicationType
  orderId: string
  orderItemId: string
  storeId: string
  storePhone: string | null
  storeName: string
  productId: string
  productName: string
  productImageUrl: string
  skuDescription: string | null
  unitPrice: number
  quantity: number
  applyQuantity: number
  refundAmount: number
  appliedAt: string
  reason: string
  description: string | null
  status: string
  statusText: string
  paymentMethod: string
}

export interface SubmitAfterSaleApplicationCommand {
  type: AfterSaleApplicationType
  orderId: string
  orderItemId: string
  storeId: string
  storeName: string
  productId: string
  productName: string
  productImageUrl: string
  skuDescription: string | null
  unitPrice: number
  quantity: number
  applyQuantity: number
  refundAmount: number
  reason: string
  description: string
  paymentMethod: string
}

export interface SaveReturnShipmentCommand {
  refundId: string
  company: string
  trackingNo: string
  shippedAt: string
}

export interface AfterSaleSnapshot {
  applications: AfterSaleRecord[]
  returnShipments: Record<string, ReturnShipmentInfo>
}
