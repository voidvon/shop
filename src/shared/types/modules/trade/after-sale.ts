export interface RefundRecord {
  refundId: string
  storeName: string
  status: string
  productImageUrl: string
  productName: string
  skuDescription: string | null
  unitPrice: number
  quantity: number
  refundAmount: number
  appliedAt: string
}

export interface ReturnRecord extends RefundRecord {
  returnQuantity: number
}

export interface AfterSaleListPageData {
  refunds: RefundRecord[]
  returns: ReturnRecord[]
}

export interface RefundEvidenceImage {
  imageUrl: string
}

export interface RefundProcessInfo {
  status: string
  remark: string | null
}

export interface RefundAmountDetail {
  paymentMethod: string
  onlineRefundAmount: number
  predepositRefundAmount: number
  rechargeCardRefundAmount: number
}

export interface RefundDetailPageData {
  refundId: string
  reason: string
  refundAmount: number
  description: string | null
  evidenceImages: RefundEvidenceImage[]
  merchantProcess: RefundProcessInfo
  platformProcess: RefundProcessInfo
  amountDetail: RefundAmountDetail
}
