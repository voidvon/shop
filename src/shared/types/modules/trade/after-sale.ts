import type { ActionPermission, PageQuery, PageResult } from '../base'

export type AfterSaleAction = 'view-detail' | 'delay' | 'ship-return'

export interface RefundRecord {
  refundId: string
  orderId: string
  orderItemId: string
  storeId: string
  storeName: string
  status: string
  statusText: string
  productImageUrl: string
  productName: string
  skuDescription: string | null
  unitPrice: number
  quantity: number
  refundAmount: number
  appliedAt: string
  actions: ActionPermission<AfterSaleAction>[]
}

export interface ReturnRecord extends RefundRecord {
  returnQuantity: number
}

export interface AfterSaleQuery extends PageQuery {
  type: 'refund' | 'return'
}

export interface AfterSaleListPageData {
  query: AfterSaleQuery
  refundPage: PageResult<RefundRecord>
  returnPage: PageResult<ReturnRecord>
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
  orderId: string
  orderItemId: string
  status: string
  statusText: string
  reason: string
  refundAmount: number
  description: string | null
  evidenceImages: RefundEvidenceImage[]
  merchantProcess: RefundProcessInfo
  platformProcess: RefundProcessInfo
  amountDetail: RefundAmountDetail
  actions: ActionPermission<AfterSaleAction>[]
}
