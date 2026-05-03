import type { ProductDetail, ProductSummary } from '../../../domain/product'
import type {
  MerchantProductQuery,
  ProductRepository,
  ProductSummaryPage,
} from '../../../domain/product-repository'

import { getMockStore, mockProducts } from '@/shared/mocks/modules'

function createProductSummary(productId: string): ProductSummary | null {
  const product = mockProducts.find((item) => item.productId === productId)

  if (!product) {
    return null
  }

  return {
    category: product.categoryName,
    categoryId: product.categoryId,
    coverImageUrl: product.imageUrl,
    id: product.productId,
    inventory: product.inventory,
    monthlySales: product.monthlySales,
    name: product.productName,
    price: product.price,
    subtitle: product.subtitle,
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
    detailDescription: product.htmlContent,
    gallery: [...product.gallery],
    sellingPoints: [...product.sellingPoints],
    serviceLabels: [...product.serviceLabels],
  }
}

const featuredProducts = mockProducts.slice(0, 4)

function normalizePrice(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function compareProductId(leftId: string, rightId: string) {
  return leftId.localeCompare(rightId, 'zh-Hans-CN', {
    numeric: true,
    sensitivity: 'base',
  })
}

export const mockProductRepository: ProductRepository = {
  async getFeaturedProductSummaries() {
    return Promise.resolve(
      featuredProducts
        .map((product) => createProductSummary(product.productId))
        .filter((product): product is ProductSummary => product !== null),
    )
  },

  async getMerchantProductSummaryPage(merchantId, query: MerchantProductQuery = {}): Promise<ProductSummaryPage> {
    const minPrice = normalizePrice(query.minPrice)
    const maxPrice = normalizePrice(query.maxPrice)
    const normalizedKeyword = query.keyword?.trim().toLowerCase() ?? ''
    const normalizedCategoryId = query.categoryId?.trim() ?? ''
    const perPage = query.perPage ?? 100
    const items = mockProducts
      .filter((product) => {
        if (product.storeId !== merchantId) {
          return false
        }

        if (normalizedCategoryId && product.categoryId !== normalizedCategoryId) {
          return false
        }

        if (minPrice !== null && product.price < minPrice) {
          return false
        }

        if (maxPrice !== null && product.price > maxPrice) {
          return false
        }

        if (!normalizedKeyword) {
          return true
        }

        const searchText = `${product.productName} ${product.categoryName} ${product.summary}`.toLowerCase()
        return searchText.includes(normalizedKeyword)
      })
      .sort((left, right) => {
        if (query.sortBy === 'price') {
          return query.sortDir === 'asc' ? left.price - right.price : right.price - left.price
        }

        if (query.sortBy === 'id') {
          return query.sortDir === 'asc'
            ? compareProductId(left.productId, right.productId)
            : compareProductId(right.productId, left.productId)
        }

        if (query.sortBy !== 'sales_count') {
          return 0
        }

        return query.sortDir === 'asc'
          ? left.monthlySales - right.monthlySales
          : right.monthlySales - left.monthlySales
      })

    return Promise.resolve(
      {
        currentPage: 1,
        items: items
          .slice(0, perPage)
          .map((product) => createProductSummary(product.productId))
          .filter((product): product is ProductSummary => product !== null),
        lastPage: 1,
        perPage,
        total: items.length,
      },
    )
  },

  async getMerchantProductSummaries(merchantId, query: MerchantProductQuery = {}) {
    const page = await this.getMerchantProductSummaryPage(merchantId, query)
    return page.items
  },

  async getProductDetail(productId) {
    return Promise.resolve(createProductDetail(productId))
  },
}
