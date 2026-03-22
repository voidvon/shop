import type { CartSnapshot } from '@/entities/cart'
import { mockTradeData } from '@/shared/mocks'
import { getMockProduct, getMockStore } from '@/shared/mocks/modules'

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

export function mapMockCartPageData(snapshot: CartSnapshot): CartPageData {
  const groupsByStoreId = new Map<
    string,
    {
      items: CartPageData['groups'][number]['items']
      storeId: string
      storeName: string
    }
  >()

  snapshot.lines.forEach((line) => {
    const product = getMockProduct(line.productId)
    const store = product ? getMockStore(product.storeId) : null
    const storeId = store?.storeId ?? 'mock-default-store'
    const storeName = store?.storeName ?? '默认店铺'
    const existingGroup = groupsByStoreId.get(storeId)
    const item = {
      lineId: line.productId,
      productId: line.productId,
      productImageUrl: product?.imageUrl ?? null,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    }

    if (existingGroup) {
      existingGroup.items.push(item)
      return
    }

    groupsByStoreId.set(storeId, {
      items: [item],
      storeId,
      storeName,
    })
  })

  return {
    groups: Array.from(groupsByStoreId.values()),
    totalAmount: snapshot.subtotal,
  }
}

export function mapMockOrderListPageData(): OrderListPageData {
  return {
    keyword: mockTradeData.orderCenterPageData.query.keyword,
    orders: mockTradeData.orderCenterPageData.orderPage.list.map(mapMockOrderEntry),
  }
}
