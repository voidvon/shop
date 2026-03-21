import { mockCatalogData, mockProducts, mockPublicData } from '@/shared/mocks'

import type {
  CategoryPageCategory,
  CategoryPageData,
  HomePageData,
  PageProductCard,
  ProductDetailPageData,
} from '../../domain/storefront-page-data'

type MockProductFeedItem = (typeof mockPublicData.homePageData.productFeed.list)[number]
type MockRecommendationItem =
  (typeof mockCatalogData.productDetailPageDataById)[keyof typeof mockCatalogData.productDetailPageDataById]['recommendations'][number]
type MockCategoryTree = typeof mockCatalogData.categoryEntryPageData.primaryCategories
type MockDetailPageData =
  (typeof mockCatalogData.productDetailPageDataById)[keyof typeof mockCatalogData.productDetailPageDataById]

export function mapMockProductCard(input: MockProductFeedItem | MockRecommendationItem): PageProductCard {
  const marketPrice = 'marketPrice' in input ? input.marketPrice : null

  return {
    id: input.productId,
    imageUrl: input.productImageUrl ?? null,
    marketPrice,
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

export function mapMockHomePageData(): HomePageData {
  return {
    banners: mockPublicData.homePageData.banners.map((banner) => ({
      description: banner.description ?? '',
      eyebrow: banner.eyebrow ?? '',
      imageUrl: banner.imageUrl ?? null,
      linkUrl: banner.linkUrl,
      title: banner.title ?? '',
    })),
    featuredProducts: mockPublicData.homePageData.productFeed.list.slice(0, 4).map(mapMockProductCard),
    quickCategories: mockPublicData.homePageData.categoryEntries.map((category) => ({
      id: category.categoryId,
      imageUrl: category.imageUrl,
      label: category.categoryName,
    })),
  }
}

export function mapMockCategoryPageData(): CategoryPageData {
  return {
    primaryCategories: mapMockCategoryTree(mockCatalogData.categoryEntryPageData.primaryCategories),
    products: mockProducts.map((product) => ({
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      id: product.productId,
      imageUrl: product.imageUrl,
      marketPrice: product.marketPrice,
      name: product.productName,
      price: product.price,
    })),
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
