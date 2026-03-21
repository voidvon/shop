import { backendAProductRepository } from '@/entities/product'

import type { StorefrontQuery } from '../../../domain/storefront-query'
import {
  mapBackendACategoryPageData,
  mapBackendAHomePageData,
  mapBackendAProductDetailPageData,
} from '../../mappers/backend-a-storefront-mapper'

export const backendAStorefrontQuery: StorefrontQuery = {
  async getCategoryPageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()
    return mapBackendACategoryPageData(products)
  },

  async getHomePageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()
    return mapBackendAHomePageData(products)
  },

  async getProductDetailPageData(productId: string) {
    const product = await backendAProductRepository.getProductDetail(productId)

    if (!product) {
      return null
    }

    const recommendedProducts = (await backendAProductRepository.getFeaturedProductSummaries())
      .filter((item) => item.id !== productId)
      .slice(0, 3)

    return mapBackendAProductDetailPageData(product, recommendedProducts)
  },
}
