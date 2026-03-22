import type { OrderRecord } from '@/entities/order'

import type { MemberOrderSummary } from '../domain/member-center-page-data'

interface CreateBrowserMemberOrderSummaryReaderOptions {
  readOrders: () => OrderRecord[]
}

const emptyMemberOrderSummary: MemberOrderSummary = {
  pendingPaymentCount: 0,
  pendingReceiptCount: 0,
  pendingReviewCount: 0,
  pendingShipmentCount: 0,
  refundAndReturnCount: 0,
}

export function createBrowserMemberOrderSummaryReader(
  options: CreateBrowserMemberOrderSummaryReaderOptions,
) {
  return function getMemberOrderSummary(): MemberOrderSummary {
    return options.readOrders().reduce<MemberOrderSummary>((summary, order) => {
      switch (order.status) {
        case 'pending-payment':
          summary.pendingPaymentCount += 1
          break
        case 'pending-shipment':
          summary.pendingShipmentCount += 1
          break
        case 'pending-receipt':
          summary.pendingReceiptCount += 1
          break
        case 'pending-review':
          summary.pendingReviewCount += 1
          break
        case 'refunding':
        case 'returning':
          summary.refundAndReturnCount += 1
          break
        default:
          break
      }

      return summary
    }, { ...emptyMemberOrderSummary })
  }
}
