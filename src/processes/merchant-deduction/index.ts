export type {
  MerchantDeductionLogItem,
  MerchantDeductionLogQuery,
  MerchantDeductionScanResult,
  MerchantDeductionService,
  MerchantDeductionSubmitCommand,
  MerchantDeductionSubmitResult,
  MerchantDeductionSummaryRow,
  MerchantDeductionUploadedImage,
} from './domain/merchant-deduction-service'
export { createBackendAMerchantDeductionService } from './infrastructure/adapters/backend-a/backend-a-merchant-deduction-service'
export { mockMerchantDeductionService } from './infrastructure/adapters/mock/mock-merchant-deduction-service'
export {
  provideMerchantDeductionService,
  useMerchantDeductionService,
} from './infrastructure/merchant-deduction-service-provider'
