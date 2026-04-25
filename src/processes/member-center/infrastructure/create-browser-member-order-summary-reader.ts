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

function isAfterSaleInProgress(order: Pick<OrderRecord, 'status' | 'statusText'>) {
  if (order.status !== 'refunding' && order.status !== 'returning') {
    return false
  }

  const statusText = order.statusText.trim()

  return !statusText.includes('完成')
    && !statusText.includes('成功')
    && !statusText.includes('已退款')
    && !statusText.includes('已退货')
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
          if (isAfterSaleInProgress(order)) {
            summary.refundAndReturnCount += 1
          }
          break
        default:
          break
      }

      return summary
    }, { ...emptyMemberOrderSummary })
  }
}
