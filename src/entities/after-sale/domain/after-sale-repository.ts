import type { ReturnShipmentInfo } from '@/shared/types/modules'

import type {
  AfterSaleRecord,
  AfterSaleSnapshot,
  SaveReturnShipmentCommand,
  SubmitAfterSaleApplicationCommand,
} from './after-sale'

export interface AfterSaleRepository {
  cancelApplication(refundId: string): Promise<AfterSaleRecord | null>
  getReturnShipment(refundId: string): Promise<ReturnShipmentInfo | null>
  getSnapshot(): Promise<AfterSaleSnapshot>
  saveReturnShipment(command: SaveReturnShipmentCommand): Promise<ReturnShipmentInfo | null>
  submitApplication(command: SubmitAfterSaleApplicationCommand): Promise<AfterSaleRecord>
}
