import {
  BackendAHttpError,
  backendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'

import type {
  MerchantProductQuery,
  ProductRepository,
  ProductSummaryPage,
} from '../../../domain/product-repository'
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
    query,
  )
}

export const backendAProductRepository: ProductRepository = {
  async getFeaturedProductSummaries() {
    const response = await fetchProductList({
      per_page: 100,
      sort_by: 'sales_count',
      sort_dir: 'desc',
    })

    return response.data
      .filter(isListedProduct)
      .map(mapBackendAProductSummaryDto)
  },

  async getMerchantProductSummaryPage(merchantId, query: MerchantProductQuery = {}): Promise<ProductSummaryPage> {
    const normalizedMerchantId = merchantId.trim()

    if (!normalizedMerchantId) {
      return {
        currentPage: 1,
        items: [],
        lastPage: 1,
        perPage: query.perPage ?? 100,
        total: 0,
      }
    }

    const response = await fetchProductList({
      ...(query.categoryId ? { category_id: query.categoryId } : {}),
      ...(query.keyword ? { keyword: query.keyword } : {}),
      ...(typeof query.maxPrice === 'number' ? { max_price: query.maxPrice } : {}),
      ...(typeof query.minPrice === 'number' ? { min_price: query.minPrice } : {}),
      merchant_id: normalizedMerchantId,
      per_page: query.perPage ?? 100,
      ...(query.sortBy ? { sort_by: query.sortBy } : {}),
      ...(query.sortDir ? { sort_dir: query.sortDir } : {}),
    })

    return {
      currentPage: response.current_page,
      items: response.data
        .filter(isListedProduct)
        .map(mapBackendAProductSummaryDto),
      lastPage: response.last_page,
      perPage: response.per_page,
      total: response.total,
    }
  },

  async getMerchantProductSummaries(merchantId, query: MerchantProductQuery = {}) {
    const page = await this.getMerchantProductSummaryPage(merchantId, query)
    return page.items
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
