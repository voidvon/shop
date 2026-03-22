import type { CartSnapshot } from '@/entities/cart'
import { getMockProduct, getMockStore } from '@/shared/mocks/modules'

import type { CartPageData } from '../../domain/trade-page-data'

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
