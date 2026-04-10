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

export interface MerchantDeductionService {
  scanCode(rawCode: string): Promise<MerchantDeductionScanResult>
  submitDeduction(command: MerchantDeductionSubmitCommand): Promise<MerchantDeductionSubmitResult>
  uploadImage(file: File): Promise<MerchantDeductionUploadedImage>
}
