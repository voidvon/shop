import type { PageResult } from '@/shared/types/modules'

export interface MerchantDeductionSummaryRow {
  label: string
  value: string
}

export interface MerchantDeductionUploadedImage {
  disk: string | null
  mimeType: string | null
  name: string
  path: string
  previewUrl: string
  size: number | null
}

export interface MerchantDeductionScanResult {
  balanceTypeId: string | null
  balanceTypeName: string | null
  cardNumber: string | null
  cardQrContent: string | null
  payerMobile: string | null
  payerName: string | null
  paymentToken: string | null
  rawCode: string
  summaryRows: MerchantDeductionSummaryRow[]
}

export interface MerchantDeductionSubmitCommand {
  amount: number
  attachments: MerchantDeductionUploadedImage[]
  balanceTypeId?: string | null
  cardQrContent?: string | null
  merchantId: string
  paymentToken?: string | null
  remark?: string | null
}

export interface MerchantDeductionSubmitResult {
  rawPayload: Record<string, unknown> | null
  successMessage: string
}

export interface MerchantDeductionRefundResult {
  rawPayload: Record<string, unknown> | null
  successMessage: string
}

export interface MerchantDeductionLogQuery {
  page: number
  pageSize: number
}

export interface MerchantDeductionLogItem {
  id: string
  amount: number
  balanceTypeName: string | null
  canRefund: boolean
  cardNumber: string | null
  createdAt: string | null
  failureReason: string | null
  merchantName: string | null
  paidAt: string | null
  paySource: 'stored-value-card' | 'user-balance' | 'unknown'
  paySourceLabel: string
  paymentNo: string
  remark: string | null
  refundNo: string | null
  refundedAt: string | null
  status: 'failed' | 'processing' | 'refunded' | 'success' | 'unknown'
  statusLabel: string
  userMobile: string | null
  userName: string | null
}

export interface MerchantDeductionService {
  getDeductionLogs(query: MerchantDeductionLogQuery): Promise<PageResult<MerchantDeductionLogItem>>
  refundDeduction(logId: string): Promise<MerchantDeductionRefundResult>
  scanCode(rawCode: string): Promise<MerchantDeductionScanResult>
  submitDeduction(command: MerchantDeductionSubmitCommand): Promise<MerchantDeductionSubmitResult>
  uploadImage(file: File): Promise<MerchantDeductionUploadedImage>
}
