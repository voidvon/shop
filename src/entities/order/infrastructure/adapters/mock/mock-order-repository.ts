import { mockTradeData } from '@/shared/mocks'

import {
  createBrowserOrderRepository,
} from '../../create-browser-order-repository'
import type { OrderRecord } from '../../../domain/order'
import type { OrderRepository } from '../../../domain/order-repository'

export function getMockOrderSeedRecords(): OrderRecord[] {
  return mockTradeData.orderCenterPageData.orderPage.list.map((order) => ({
    itemCount: order.itemCount,
    items: order.items.map((item) => ({
      orderItemId: item.orderItemId,
      productImageUrl: item.productImageUrl,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    orderId: order.orderId,
    orderNo: order.orderNo,
    paymentMethod: mockTradeData.orderDetailPageDataById[order.orderId]?.paymentMethod ?? null,
    shippingAmount: order.shippingAmount,
    status: order.status,
    statusText: order.statusText,
    storeName: order.storeName,
    totalAmount: order.totalAmount,
  }))
}

export const mockOrderRepository: OrderRepository = createBrowserOrderRepository({
  defaultStoreName: '模拟订单',
  getScopeKey: () => 'guest',
  getSeedRecords: getMockOrderSeedRecords,
  namespace: 'mock',
})
