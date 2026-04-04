import { mockAreas, mockCatalogData, mockImageUrl, mockProducts, mockPublicData, mockStores } from '@/shared/mocks'
import { getMockStore } from '@/shared/mocks'
import type { ProductSummary } from '@/entities/product'

import type {
  CategoryPageCategory,
  CategoryPageProductCard,
  HomePageData,
  PartnerStoreMerchant,
  PartnerStoreRegion,
  PageProductCard,
  ProductDetailPageData,
  StoreHomePageData,
} from '../../domain/storefront-page-data'
import type { CategoryProductsQuery, PartnerStoreMerchantsQuery } from '../../domain/storefront-query'

type MockProductFeedItem = (typeof mockPublicData.homePageData.productFeed.list)[number]
type MockRecommendationItem =
  (typeof mockCatalogData.productDetailPageDataById)[keyof typeof mockCatalogData.productDetailPageDataById]['recommendations'][number]
type MockCategoryTree = typeof mockCatalogData.categoryEntryPageData.primaryCategories
type MockDetailPageData =
  (typeof mockCatalogData.productDetailPageDataById)[keyof typeof mockCatalogData.productDetailPageDataById]

export function mapMockProductCard(input: MockProductFeedItem | MockRecommendationItem): PageProductCard {
  const marketPrice = 'marketPrice' in input ? input.marketPrice : null
  const monthlySales = 'monthlySales' in input ? input.monthlySales : 0

  return {
    id: input.productId,
    imageUrl: input.productImageUrl ?? null,
    marketPrice,
    monthlySales,
    name: input.productName,
    price: input.price,
  }
}

function mapMockCategoryTree(categories: MockCategoryTree): CategoryPageCategory[] {
  return categories.map((category) => ({
    children: mapMockCategoryTree(category.children),
    id: category.categoryId,
    imageUrl: category.imageUrl,
    label: category.categoryName,
  }))
}

function collectCategoryIds(categories: MockCategoryTree, targetCategoryId: string): string[] | null {
  for (const category of categories) {
    if (category.categoryId === targetCategoryId) {
      return collectLeafCategoryIds(category)
    }

    const nestedMatch = collectCategoryIds(category.children, targetCategoryId)
    if (nestedMatch) {
      return nestedMatch
    }
  }

  return null
}

function collectLeafCategoryIds(category: MockCategoryTree[number]): string[] {
  if (category.children.length === 0) {
    return [category.categoryId]
  }

  return category.children.flatMap((child) => collectLeafCategoryIds(child))
}

export function mapMockCategoryTreeData(): CategoryPageCategory[] {
  return mapMockCategoryTree(mockCatalogData.categoryEntryPageData.primaryCategories)
}

export function mapMockCategoryProducts(query: CategoryProductsQuery = {}): CategoryPageProductCard[] {
  const normalizedKeyword = query.keyword?.trim().toLowerCase() ?? ''
  const matchedCategoryIds = query.categoryId
    ? new Set(collectCategoryIds(mockCatalogData.categoryEntryPageData.primaryCategories, query.categoryId) ?? [])
    : null
  const normalizedMerchantId = query.merchantId?.trim() ?? ''

  return mockProducts
    .filter((product) => {
      if (normalizedMerchantId && product.storeId !== normalizedMerchantId) {
        return false
      }

      if (matchedCategoryIds && !matchedCategoryIds.has(product.categoryId)) {
        return false
      }

      if (!normalizedKeyword) {
        return true
      }

      const searchText = `${product.productName} ${product.categoryName}`.toLowerCase()
      return searchText.includes(normalizedKeyword)
    })
    .map((product) => ({
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      id: product.productId,
      imageUrl: product.imageUrl,
      marketPrice: product.marketPrice,
      monthlySales: product.monthlySales,
      name: product.productName,
      price: product.price,
    }))
}

export function mapMockHomePageData(): HomePageData {
  return {
    banners: mockPublicData.homePageData.banners.map((banner) => ({
      description: banner.description ?? '',
      eyebrow: banner.eyebrow ?? '',
      imageUrl: banner.imageUrl ?? null,
      linkUrl: banner.linkUrl,
      title: banner.title ?? '',
    })),
    featuredProducts: mockPublicData.homePageData.productFeed.list.map(mapMockProductCard),
    partnerStoreTypes: [],
    promo_video: null,
    quickCategories: mockPublicData.homePageData.categoryEntries.map((category) => ({
      id: category.categoryId,
      imageUrl: category.imageUrl,
      label: category.categoryName,
    })),
  }
}

export function mapMockPartnerRegions(): PartnerStoreRegion[] {
  return mockAreas.map((area) => ({
    id: area.areaId,
    label: area.areaName,
  }))
}

export function mapMockPartnerMerchants(query: PartnerStoreMerchantsQuery = {}): PartnerStoreMerchant[] {
  const normalizedRegionId = query.regionId?.trim() ?? ''
  const normalizedKeyword = query.keyword?.trim().toLowerCase() ?? ''

  return mockStores
    .filter((store) => {
      if (normalizedRegionId && store.areaId !== normalizedRegionId) {
        return false
      }

      if (!normalizedKeyword) {
        return true
      }

      const searchText = `${store.storeName} ${store.address}`.toLowerCase()
      return searchText.includes(normalizedKeyword)
    })
    .map((store) => ({
      address: store.address,
      businessHours: store.businessHours,
      id: store.storeId,
      imageUrl: store.logoUrl || mockImageUrl,
      name: store.storeName,
      phone: store.phone,
      regionName: mockAreas.find((area) => area.areaId === store.areaId)?.areaName ?? null,
      shortName: store.storeName,
      storeTypeLabels: ['合作门店'],
    }))
}

export function mapMockStoreHomePageData(
  storeId: string,
  products: ProductSummary[],
): StoreHomePageData | null {
  const store = getMockStore(storeId)

  if (!store) {
    return null
  }

  return {
    address: store.address,
    benefitTips: [...store.benefitTips],
    businessHours: store.businessHours,
    followerCount: store.followerCount,
    isFavorited: true,
    phone: store.phone,
    products,
    storeId: store.storeId,
    storeLogoUrl: store.logoUrl,
    storeName: store.storeName,
    summary: `${store.storeName} · 营业时间 ${store.businessHours}`,
    tabs: ['home', 'all-products', 'new-products', 'promotions'],
  }
}

export function mapMockProductDetailPageData(
  product: ProductDetailPageData['product'],
  pageData: MockDetailPageData,
): ProductDetailPageData {
  return {
    defaultSkuId: pageData.defaultSkuId,
    product,
    quantity: Math.max(pageData.quantity, 1),
    recommendations: pageData.recommendations.map(mapMockProductCard),
    review: {
      count: pageData.reviewCount,
      rate: pageData.reviewRate,
    },
    selectedSkuId: pageData.selectedSkuId,
    skuList: pageData.skuList.map((sku) => ({ ...sku })),
    store: pageData.store
      ? {
          score: { ...pageData.store.score },
          storeId: pageData.store.storeId,
          storeName: pageData.store.storeName,
        }
      : null,
  }
}
