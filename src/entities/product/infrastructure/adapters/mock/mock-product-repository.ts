import type { ProductDetail, ProductSummary } from '../../../domain/product'
import type { ProductRepository } from '../../../domain/product-repository'

import { getMockStore, mockProducts } from '@/shared/mocks/modules'

function createProductSummary(productId: string): ProductSummary | null {
  const product = mockProducts.find((item) => item.productId === productId)

  if (!product) {
    return null
  }

  return {
    category: product.categoryName,
    coverImageUrl: product.imageUrl,
    id: product.productId,
    inventory: product.inventory,
    monthlySales: product.monthlySales,
    name: product.productName,
    price: product.price,
    summary: product.summary,
    tags: [...product.sellingPoints],
  }
}

function createProductDetail(productId: string): ProductDetail | null {
  const product = mockProducts.find((item) => item.productId === productId)

  if (!product) {
    return null
  }

  const summary = createProductSummary(productId)
  const store = getMockStore(product.storeId)

  if (!summary || !store) {
    return null
  }

  return {
    ...summary,
    attributes: [
      ...product.attributes.map((attribute) => ({ ...attribute })),
      { label: '店铺', value: store.storeName },
    ],
    detailDescription: product.htmlContent.replace(/<[^>]+>/g, ''),
    gallery: [...product.gallery],
    sellingPoints: [...product.sellingPoints],
    serviceLabels: [...product.serviceLabels],
  }
}

const featuredProducts = mockProducts.slice(0, 4)

export const mockProductRepository: ProductRepository = {
  async getFeaturedProductSummaries() {
    return Promise.resolve(
      featuredProducts
        .map((product) => createProductSummary(product.productId))
        .filter((product): product is ProductSummary => product !== null),
    )
  },

  async getMerchantProductSummaries(merchantId) {
    return Promise.resolve(
      mockProducts
        .filter((product) => product.storeId === merchantId)
        .map((product) => createProductSummary(product.productId))
        .filter((product): product is ProductSummary => product !== null),
    )
  },

  async getProductDetail(productId) {
    return Promise.resolve(createProductDetail(productId))
  },
}
