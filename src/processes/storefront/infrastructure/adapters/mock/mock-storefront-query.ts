import { mockProductRepository } from '@/entities/product'
import { mockCatalogData } from '@/shared/mocks'

import type { StorefrontQuery } from '../../../domain/storefront-query'
import {
  mapMockCategoryProducts,
  mapMockCategoryTreeData,
  mapMockHomePageData,
  mapMockPartnerMerchants,
  mapMockPartnerRegions,
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

  async getPartnerMerchants(query) {
    return Promise.resolve(mapMockPartnerMerchants(query))
  },

  async getPartnerRegions() {
    return Promise.resolve(mapMockPartnerRegions())
  },

  async getPartnerStoreTypes() {
    return Promise.resolve(mapMockHomePageData().partnerStoreTypes)
  },

  async getPlatformSettingsData() {
    return Promise.resolve({
      address: '湖北省武汉市江汉区青年路 88 号',
      businessPhone: '027-88886666',
      companyName: '城市生活精选平台',
      customerServicePhone: '400-800-9000',
      customerServiceWechat: 'citymall_service',
      domain: 'https://mall.example.com',
      icpNumber: '鄂ICP备2026000123号',
      logoUrl: null,
    })
  },

  async getProductDetailPageData(productId: string) {
    const product = await mockProductRepository.getProductDetail(productId)
    const pageData = mockCatalogData.productDetailPageDataById[productId]

    if (!product || !pageData) {
      return null
    }

    return mapMockProductDetailPageData(product, pageData)
  },

  async getStoreProducts(query) {
    const page = await this.getStoreProductPage(query)
    return page.items
  },

  async getStoreProductPage(query) {
    return mockProductRepository.getMerchantProductSummaryPage(query.merchantId, {
      categoryId: query.categoryId,
      maxPrice: query.maxPrice,
      minPrice: query.minPrice,
      perPage: query.perPage,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    })
  },

  async getStoreHomePageData(storeId) {
    const products = await mockProductRepository.getMerchantProductSummaries(storeId, {
      sortBy: 'sales_count',
      sortDir: 'desc',
    })
    return mapMockStoreHomePageData(storeId, products)
  },
}
