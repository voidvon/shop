import {
  BackendAHttpError,
  backendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'
import { backendAProductRepository } from '@/entities/product'
import type { BackendAProductDetailDto } from '@/entities/product/infrastructure/dto/backend-a-product.dto'

import type { StorefrontQuery } from '../../../domain/storefront-query'
import {
  type BackendAStorefrontCategoryDto,
  type BackendAStorefrontHomeDto,
  type BackendAStorefrontProductDto,
  mapBackendACategoryPageData,
  mapBackendAHomePageData,
  mapBackendAProductDetailPageData,
} from '../../mappers/backend-a-storefront-mapper'

interface BackendAProductCategoriesResponseDto {
  list: BackendAStorefrontCategoryDto[]
  tree: BackendAStorefrontCategoryDto[]
}

interface BackendAStorefrontProductsResponseDto {
  current_page: number
  data: BackendAStorefrontProductDto[]
  last_page: number
  per_page: number
  total: number
}

export const backendAStorefrontQuery: StorefrontQuery = {
  async getCategoryPageData() {
    const [categoryData, productData] = await Promise.all([
      backendAHttpClient.get<BackendAProductCategoriesResponseDto>('/api/v1/product-categories'),
      backendAHttpClient.get<BackendAStorefrontProductsResponseDto>('/api/v1/products', {
        per_page: 100,
        sort_by: 'sales_count',
        sort_dir: 'desc',
      }),
    ])

    return mapBackendACategoryPageData(
      categoryData.tree,
      productData.data.filter((product) => product.status === 1),
    )
  },

  async getHomePageData() {
    const homeData = await backendAHttpClient.get<BackendAStorefrontHomeDto>('/api/v1/home')
    return mapBackendAHomePageData(homeData)
  },

  async getProductDetailPageData(productId: string) {
    let product: BackendAProductDetailDto

    try {
      product = await backendAHttpClient.get<BackendAProductDetailDto>(
        `/api/v1/products/${encodeURIComponent(productId)}`,
      )
    } catch (error) {
      if (error instanceof BackendAHttpError && error.status === 404) {
        return null
      }

      throw error
    }

    if (product.status !== 1) {
      return null
    }

    const recommendedProducts = (await backendAProductRepository.getFeaturedProductSummaries())
      .filter((item) => item.id !== productId)
      .slice(0, 3)

    return mapBackendAProductDetailPageData(product, recommendedProducts)
  },
}
