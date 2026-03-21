import type { CartSnapshot } from '@/entities/cart'

import type { CartPageData, OrderListPageData } from '../../domain/trade-page-data'

export function mapBackendACartPageData(snapshot: CartSnapshot): CartPageData {
  return {
    groups: [
      {
        items: snapshot.lines.map((line, index) => ({
          lineId: `backend-a-line-${index + 1}`,
          productId: line.productId,
          productImageUrl: null,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        storeId: 'backend-a-store',
        storeName: 'Backend A 选品馆',
      },
    ],
    totalAmount: snapshot.subtotal,
  }
}

export function mapBackendAOrderListPageData(): OrderListPageData {
  return {
    keyword: '',
    orders: [
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
    ],
  }
}
