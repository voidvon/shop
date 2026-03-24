import {
  BackendAHttpError,
  backendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'

import type { ProductRepository } from '../../../domain/product-repository'
import type { BackendAProductDetailDto } from '../../dto/backend-a-product.dto'
import {
  mapBackendAProductDetailDto,
  mapBackendAProductSummaryDto,
} from '../../mappers/product-dto-mapper'

interface BackendAProductListResponseDto {
  current_page: number
  data: BackendAProductDetailDto[]
  last_page: number
  per_page: number
  total: number
}

function isListedProduct(product: BackendAProductDetailDto) {
  return product.status === 1
}

async function fetchProductList(query?: Record<string, string | number>) {
  return backendAHttpClient.get<BackendAProductListResponseDto>(
    '/api/v1/products',
    {
      per_page: 100,
      sort_by: 'sales_count',
      sort_dir: 'desc',
      ...query,
    },
  )
}

export const backendAProductRepository: ProductRepository = {
  async getFeaturedProductSummaries() {
    const response = await fetchProductList()

    return response.data
      .filter(isListedProduct)
      .map(mapBackendAProductSummaryDto)
  },

  async getMerchantProductSummaries(merchantId) {
    const normalizedMerchantId = merchantId.trim()

    if (!normalizedMerchantId) {
      return []
    }

    const response = await fetchProductList({
      merchant_id: normalizedMerchantId,
    })

    return response.data
      .filter(isListedProduct)
      .map(mapBackendAProductSummaryDto)
  },

  async getProductDetail(productId) {
    try {
      const product = await backendAHttpClient.get<BackendAProductDetailDto>(
        `/api/v1/products/${encodeURIComponent(productId)}`,
      )

      return isListedProduct(product) ? mapBackendAProductDetailDto(product) : null
    } catch (error) {
      if (error instanceof BackendAHttpError && error.status === 404) {
        return null
      }

      throw error
    }
  },
}
