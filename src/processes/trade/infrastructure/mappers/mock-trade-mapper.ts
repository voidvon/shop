import { mockTradeData } from '@/shared/mocks'

import type { CartPageData, OrderListEntry, OrderListPageData } from '../../domain/trade-page-data'

type MockOrderEntry = (typeof mockTradeData.orderCenterPageData.orderPage.list)[number]

function mapMockOrderEntry(order: MockOrderEntry): OrderListEntry {
  return {
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
    shippingAmount: order.shippingAmount,
    status: order.status,
    statusText: order.statusText,
    storeName: order.storeName,
    totalAmount: order.totalAmount,
  }
}

export function mapMockCartPageData(): CartPageData {
  return {
    groups: mockTradeData.cartPageData.groups.map((group) => ({
      items: group.items.map((item) => ({
        lineId: item.lineId,
        productId: item.productId,
        productImageUrl: item.productImageUrl,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      storeId: group.storeId,
      storeName: group.storeName,
    })),
    totalAmount: mockTradeData.cartPageData.totalAmount,
  }
}

export function mapMockOrderListPageData(): OrderListPageData {
  return {
    keyword: mockTradeData.orderCenterPageData.query.keyword,
    orders: mockTradeData.orderCenterPageData.orderPage.list.map(mapMockOrderEntry),
  }
}
