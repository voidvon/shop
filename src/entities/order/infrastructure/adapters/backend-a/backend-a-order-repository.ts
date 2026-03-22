import {
  createBrowserOrderRepository,
} from '../../create-browser-order-repository'
import type {
  CreateCheckoutPreviewCommand,
  OrderRecord,
} from '../../../domain/order'
import type { OrderRepository } from '../../../domain/order-repository'

function resolveDiscount(command: CreateCheckoutPreviewCommand) {
  const subtotal = command.lines.reduce((sum, line) => sum + line.lineTotal, 0)
  return command.source === 'cart' ? Math.round(subtotal * 0.08) : Math.round(subtotal * 0.05)
}

export function getBackendAOrderSeedRecords(): OrderRecord[] {
  return [
    {
      itemCount: 1,
      items: [
        {
          orderItemId: 'backend-a-order-item-1',
          productImageUrl: null,
          productName: '织面桌面蓝牙音箱',
          quantity: 1,
          unitPrice: 379,
        },
      ],
      orderId: 'backend-a-order-1',
      orderNo: 'BACKENDA20260321001',
      shippingAmount: 0,
      status: 'pending-payment',
      statusText: '待付款',
      storeName: 'Backend A 选品馆',
      totalAmount: 379,
    },
  ]
}

export const backendAOrderRepository: OrderRepository = createBrowserOrderRepository({
  defaultStoreName: 'Backend A 选品馆',
  getScopeKey: () => 'guest',
  getSeedRecords: getBackendAOrderSeedRecords,
  namespace: 'backend-a',
  resolveDiscount,
})
