import {
  BackendAHttpError,
  backendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'
import { backendAProductRepository } from '@/entities/product'
import type { BackendAProductDetailDto } from '@/entities/product/infrastructure/dto/backend-a-product.dto'

import type { CategoryProductsQuery, StorefrontQuery } from '../../../domain/storefront-query'
import {
  type BackendAStorefrontCategoryDto,
  type BackendAStorefrontHomeDto,
  type BackendAPartnerMerchantDto,
  type BackendAStorefrontProductDto,
  mapBackendACategoryProducts,
  mapBackendACategoryTree,
  mapBackendAHomePageData,
  mapBackendAProductDetailPageData,
  mapBackendAStoreHomePageData,
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

async function fetchBackendACategoryTreeDto() {
  return backendAHttpClient.get<BackendAProductCategoriesResponseDto>('/api/v1/product-categories')
}

async function fetchBackendACategoryProductsDto(query: CategoryProductsQuery = {}) {
  return backendAHttpClient.get<BackendAStorefrontProductsResponseDto>('/api/v1/products', {
    ...(query.categoryId ? { category_id: query.categoryId } : {}),
    ...(query.keyword ? { keyword: query.keyword } : {}),
    ...(query.merchantId ? { merchant_id: query.merchantId } : {}),
    per_page: 100,
    sort_by: 'sales_count',
    sort_dir: 'desc',
  })
}

async function fetchBackendACategoryTree() {
  const categoryData = await fetchBackendACategoryTreeDto()
  return mapBackendACategoryTree(categoryData.tree)
}

async function fetchBackendAPartnerMerchantDto(storeId: string) {
  try {
    return await backendAHttpClient.get<BackendAPartnerMerchantDto>(
      `/api/v1/partner-merchants/${encodeURIComponent(storeId)}`,
    )
  } catch (error) {
    if (error instanceof BackendAHttpError && error.status === 404) {
      return null
    }

    throw error
  }
}

async function fetchBackendACategoryProducts(query: CategoryProductsQuery = {}) {
  const response = await fetchBackendACategoryProductsDto(query)
  return mapBackendACategoryProducts(response.data.filter((product) => product.status === 1))
}

export const backendAStorefrontQuery: StorefrontQuery = {
  async getCategoryProducts(query) {
    return fetchBackendACategoryProducts(query)
  },

  async getCategoryTree() {
    return fetchBackendACategoryTree()
  },

  async getHomePageData() {
    const homeData = await backendAHttpClient.get<BackendAStorefrontHomeDto>('/api/v1/home', {
      category_limit: 8,
      product_limit: 50,
    })

    const mappedHomePageData = mapBackendAHomePageData(homeData)

    if (import.meta.env.DEV) {
      console.log('[storefront] /api/v1/home raw', homeData)
      console.log('[storefront] /api/v1/home mapped', mappedHomePageData)
    }

    return mappedHomePageData
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

  async getStoreHomePageData(storeId: string) {
    const normalizedStoreId = storeId.trim()

    if (!normalizedStoreId) {
      return null
    }

    const [merchantResult, productsResult] = await Promise.allSettled([
      fetchBackendAPartnerMerchantDto(normalizedStoreId),
      backendAProductRepository.getMerchantProductSummaries(normalizedStoreId),
    ])

    if (merchantResult.status === 'rejected' && productsResult.status === 'rejected') {
      throw merchantResult.reason
    }

    const merchant = merchantResult.status === 'fulfilled' ? merchantResult.value : null
    const products = productsResult.status === 'fulfilled' ? productsResult.value : []

    if (!merchant && products.length === 0) {
      return null
    }

    return mapBackendAStoreHomePageData({
      merchant,
      products,
      storeId: normalizedStoreId,
    })
  },
}
