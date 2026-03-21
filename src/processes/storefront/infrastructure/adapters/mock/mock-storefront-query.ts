import { mockProductRepository } from '@/entities/product'
import { mockCatalogData } from '@/shared/mocks'

import type { StorefrontQuery } from '../../../domain/storefront-query'
import {
  mapMockCategoryPageData,
  mapMockHomePageData,
  mapMockProductDetailPageData,
} from '../../mappers/mock-storefront-mapper'

export const mockStorefrontQuery: StorefrontQuery = {
  async getCategoryPageData() {
    return Promise.resolve(mapMockCategoryPageData())
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
}
