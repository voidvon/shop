import type { CartSnapshot } from '@/entities/cart'

import type { CartPageData } from '../../domain/trade-page-data'

export function mapBackendACartPageData(snapshot: CartSnapshot): CartPageData {
  if (snapshot.lines.length === 0) {
    return {
      groups: [],
      totalAmount: 0,
    }
  }

  return {
    groups: [
      {
        items: snapshot.lines.map((line) => ({
          balanceTypeName: line.balanceTypeName ?? null,
          lineId: line.lineId,
          productId: line.productId,
          productImageUrl: line.productImageUrl ?? null,
          productName: line.productName,
          quantity: line.quantity,
          specText: line.specText ?? null,
          unitPrice: line.unitPrice,
        })),
        storeId: 'backend-a-store',
        storeName: 'Backend A 选品馆',
      },
    ],
    totalAmount: snapshot.subtotal,
  }
}
