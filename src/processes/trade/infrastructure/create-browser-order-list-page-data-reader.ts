import type { OrderRecord } from '@/entities/order'

import type { OrderListEntry, OrderListPageData } from '../domain/trade-page-data'

interface CreateBrowserOrderListPageDataReaderOptions {
  readOrders: () => OrderRecord[]
}

function mapOrderRecord(order: OrderRecord): OrderListEntry {
  return {
    itemCount: order.itemCount,
    items: order.items.map((item) => ({
      orderItemId: item.orderItemId,
      productId: item.productId,
      productImageUrl: item.productImageUrl,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    orderId: order.orderId,
    orderNo: order.orderNo,
    shippingAmount: order.shippingAmount,
    status: order.status === 'all' ? 'pending-payment' : order.status,
    statusText: order.statusText,
    storeName: order.storeName,
    totalAmount: order.totalAmount,
  }
}

export function createBrowserOrderListPageDataReader(options: CreateBrowserOrderListPageDataReaderOptions) {
  return function getOrderListPageData(): OrderListPageData {
    return {
      keyword: '',
      orders: options.readOrders().map(mapOrderRecord),
    }
  }
}
