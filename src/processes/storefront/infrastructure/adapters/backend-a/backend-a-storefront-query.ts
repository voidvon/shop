import type { MemberAuthSession } from '@/entities/member-auth'
import { backendAProductRepository } from '@/entities/product'
import type { BackendAProductDetailDto } from '@/entities/product/infrastructure/dto/backend-a-product.dto'
import {
  BackendAHttpError,
  createBackendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'

import type { CategoryProductsQuery, StoreProductsQuery, StorefrontQuery } from '../../../domain/storefront-query'
import {
  type BackendAMerchantCouponDto,
  type BackendAPlatformSettingsDto,
  type BackendAPartnerMerchantDto,
  type BackendAPartnerMerchantSummaryDto,
  type BackendAPartnerRegionDto,
  type BackendAPartnerStoreTypeDto,
  type BackendAStorefrontCategoryDto,
  type BackendAStorefrontHomeDto,
  type BackendAStorefrontProductDto,
  mapBackendACategoryProducts,
  mapBackendACategoryTree,
  mapBackendAHomePageData,
  mapBackendAMerchantCoupons,
  mapBackendAPartnerMerchants,
  mapBackendAPartnerRegions,
  mapBackendAPartnerStoreTypes,
  mapBackendAPlatformSettingsData,
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

interface BackendAPartnerMerchantsResponseDto {
  data: BackendAPartnerMerchantSummaryDto[]
}

interface BackendAMerchantCouponsResponseDto {
  data: BackendAMerchantCouponDto[]
}

export function createBackendAStorefrontQuery(memberAuthSession: MemberAuthSession): StorefrontQuery {
  const publicHttpClient = createBackendAHttpClient()
  const authedHttpClient = createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })

  async function fetchBackendACategoryTreeDto() {
    return publicHttpClient.get<BackendAProductCategoriesResponseDto>('/api/v1/product-categories')
  }

  async function fetchBackendACategoryProductsDto(query: CategoryProductsQuery = {}) {
    return publicHttpClient.get<BackendAStorefrontProductsResponseDto>('/api/v1/products', {
      ...(query.categoryId ? { category_id: query.categoryId } : {}),
      ...(query.keyword ? { keyword: query.keyword } : {}),
      ...(query.merchantId ? { merchant_id: query.merchantId } : {}),
      per_page: 100,
      sort_by: 'sales_count',
      sort_dir: 'desc',
    })
  }

  async function fetchBackendAStoreMerchantDto(storeId: string) {
    try {
      return await publicHttpClient.get<BackendAPartnerMerchantDto>(
        `/api/v1/partner-merchants/${encodeURIComponent(storeId)}`,
      )
    } catch (error) {
      if (error instanceof BackendAHttpError && error.status === 404) {
        return null
      }

      throw error
    }
  }

  async function fetchBackendAPartnerStoreTypesDto() {
    return publicHttpClient.get<BackendAPartnerStoreTypeDto[]>('/api/v1/partner-store-types')
  }

  async function fetchBackendAPartnerRegionsDto() {
    return publicHttpClient.get<BackendAPartnerRegionDto[]>('/api/v1/partner-regions')
  }

  async function fetchBackendAPartnerMerchantsDto(query: {
    keyword?: string
    perPage?: number
    regionId?: string
    storeTypeId?: string
  } = {}) {
    return publicHttpClient.get<BackendAPartnerMerchantsResponseDto>('/api/v1/partner-merchants', {
      ...(query.keyword ? { keyword: query.keyword } : {}),
      ...(query.regionId ? { region_id: query.regionId } : {}),
      ...(query.storeTypeId ? { store_type_id: query.storeTypeId } : {}),
      per_page: query.perPage ?? 100,
    })
  }

  async function fetchBackendAMerchantCouponsDto(merchantId: string, useAuth: boolean) {
    const httpClient = useAuth ? authedHttpClient : publicHttpClient

    return httpClient.get<BackendAMerchantCouponsResponseDto | BackendAMerchantCouponDto[]>(
      '/api/v1/merchant-coupons',
      {
      merchant_id: merchantId,
      },
    )
  }

  function normalizeMerchantCouponItems(
    response: BackendAMerchantCouponsResponseDto | BackendAMerchantCouponDto[],
  ) {
    if (Array.isArray(response)) {
      return response
    }

    if (Array.isArray(response.data)) {
      return response.data
    }

    return []
  }

  return {
    async claimMerchantCoupon(couponTemplateId) {
      await authedHttpClient.post(`/api/v1/coupons/${encodeURIComponent(couponTemplateId)}/claim`)
    },

    async getCategoryProducts(query) {
      const response = await fetchBackendACategoryProductsDto(query)
      return mapBackendACategoryProducts(response.data.filter((product) => product.status === 1))
    },

    async getCategoryTree() {
      const categoryData = await fetchBackendACategoryTreeDto()
      return mapBackendACategoryTree(categoryData.tree)
    },

    async getHomePageData() {
      const [homeDataResult, partnerStoreTypesResult] = await Promise.allSettled([
        publicHttpClient.get<BackendAStorefrontHomeDto>('/api/v1/home', {
          category_limit: 8,
          product_limit: 50,
        }),
        fetchBackendAPartnerStoreTypesDto(),
      ])

      if (homeDataResult.status === 'rejected') {
        throw homeDataResult.reason
      }

      const homeData = homeDataResult.value
      const mappedHomePageData = mapBackendAHomePageData(homeData)
      const partnerStoreTypes =
        partnerStoreTypesResult.status === 'fulfilled'
          ? mapBackendAPartnerStoreTypes(partnerStoreTypesResult.value)
          : mappedHomePageData.partnerStoreTypes

      if (import.meta.env.DEV && partnerStoreTypesResult.status === 'rejected') {
        console.warn('[storefront] /api/v1/partner-store-types failed', partnerStoreTypesResult.reason)
      }

      const mergedHomePageData = {
        ...mappedHomePageData,
        partnerStoreTypes,
      }

      if (import.meta.env.DEV) {
        console.log('[storefront] /api/v1/home raw', homeData)
        console.log('[storefront] /api/v1/home mapped', mergedHomePageData)
      }

      return mergedHomePageData
    },

    async getMerchantCoupons(merchantId) {
      const normalizedMerchantId = merchantId.trim()

      if (!normalizedMerchantId) {
        return []
      }

      try {
        const response = await fetchBackendAMerchantCouponsDto(normalizedMerchantId, true)
        return mapBackendAMerchantCoupons(normalizeMerchantCouponItems(response))
      } catch (error) {
        if (error instanceof BackendAHttpError && error.status === 401) {
          const response = await fetchBackendAMerchantCouponsDto(normalizedMerchantId, false)
          return mapBackendAMerchantCoupons(normalizeMerchantCouponItems(response))
        }

        if (error instanceof BackendAHttpError && error.status === 404) {
          return []
        }

        throw error
      }
    },

    async getPartnerMerchants(query) {
      const response = await fetchBackendAPartnerMerchantsDto({
        keyword: query?.keyword,
        regionId: query?.regionId,
        storeTypeId: query?.storeTypeId,
      })

      return mapBackendAPartnerMerchants(response.data)
    },

    async getPartnerRegions() {
      const response = await fetchBackendAPartnerRegionsDto()
      return mapBackendAPartnerRegions(response)
    },

    async getPartnerStoreTypes() {
      const response = await fetchBackendAPartnerStoreTypesDto()
      return mapBackendAPartnerStoreTypes(response)
    },

    async getPlatformSettingsData() {
      const platformSettings = await publicHttpClient.get<BackendAPlatformSettingsDto>(
        '/api/v1/platform/settings',
      )

      return mapBackendAPlatformSettingsData(platformSettings)
    },

    async getProductDetailPageData(productId: string) {
      let product: BackendAProductDetailDto

      try {
        product = await publicHttpClient.get<BackendAProductDetailDto>(
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

    async getStoreProducts(query: StoreProductsQuery) {
      const page = await this.getStoreProductPage(query)
      return page.items
    },

    async getStoreProductPage(query: StoreProductsQuery) {
      return backendAProductRepository.getMerchantProductSummaryPage(query.merchantId, {
        categoryId: query.categoryId,
        maxPrice: query.maxPrice,
        minPrice: query.minPrice,
        perPage: query.perPage,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
      })
    },

    async getStoreHomePageData(storeId: string) {
      const normalizedStoreId = storeId.trim()

      if (!normalizedStoreId) {
        return null
      }

      const [merchantResult, productsResult] = await Promise.allSettled([
        fetchBackendAStoreMerchantDto(normalizedStoreId),
        backendAProductRepository.getMerchantProductSummaries(normalizedStoreId, {
          sortBy: 'sales_count',
          sortDir: 'desc',
        }),
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
}
