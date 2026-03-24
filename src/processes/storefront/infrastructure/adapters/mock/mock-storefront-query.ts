import { mockProductRepository } from '@/entities/product'
import { mockCatalogData } from '@/shared/mocks'

import type { StorefrontQuery } from '../../../domain/storefront-query'
import {
  mapMockCategoryProducts,
  mapMockCategoryTreeData,
  mapMockHomePageData,
  mapMockProductDetailPageData,
  mapMockStoreHomePageData,
} from '../../mappers/mock-storefront-mapper'

export const mockStorefrontQuery: StorefrontQuery = {
  async getCategoryProducts(query) {
    return Promise.resolve(mapMockCategoryProducts(query))
  },

  async getCategoryTree() {
    return Promise.resolve(mapMockCategoryTreeData())
  },

  async getHomePageData() {
    return Promise.resolve(mapMockHomePageData())
  },

  async getProductDetailPageData(productId: string) {
    const product = await mockProductRepository.getProductDetail(productId)
    const pageData = mockCatalogData.productDetailPageDataById[productId]

    if (!product || !pageData) {
      return null
    }

    return mapMockProductDetailPageData(product, pageData)
  },

  async getStoreHomePageData(storeId) {
    const products = await mockProductRepository.getMerchantProductSummaries(storeId)
    return mapMockStoreHomePageData(storeId, products)
  },
}
