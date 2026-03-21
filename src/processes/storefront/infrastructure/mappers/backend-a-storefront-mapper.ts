import type { ProductDetail, ProductSummary } from '@/entities/product'

import type {
  CategoryPageCategory,
  CategoryPageData,
  HomePageData,
  PageProductCard,
  ProductDetailPageData,
} from '../../domain/storefront-page-data'

export function mapBackendAProductCard(product: ProductSummary): PageProductCard {
  return {
    id: product.id,
    imageUrl: product.coverImageUrl,
    marketPrice: null,
    name: product.name,
    price: product.price,
  }
}

export function mapBackendACategoryPageData(products: ProductSummary[]): CategoryPageData {
  const secondaryCategories = Array.from(
    new Map(
      products.map((product) => [
        product.category,
        {
          children: [] as CategoryPageCategory[],
          id: `backend-a-category-${product.category}`,
          imageUrl: null,
          label: product.category,
        },
      ]),
    ).values(),
  )

  return {
    primaryCategories: [
      {
        children: secondaryCategories,
        id: 'backend-a-primary-all',
        imageUrl: null,
        label: '全部分类',
      },
    ],
    products: products.map((product) => ({
      categoryId: `backend-a-category-${product.category}`,
      categoryName: product.category,
      id: product.id,
      imageUrl: product.coverImageUrl,
      marketPrice: null,
      name: product.name,
      price: product.price,
    })),
  }
}

export function mapBackendAHomePageData(products: ProductSummary[]): HomePageData {
  return {
    banners: [
      {
        description: '按 Backend A 协议适配后的首页数据。',
        eyebrow: 'Backend A',
        imageUrl: null,
        linkUrl: '/',
        title: '统一前端模型演示',
      },
    ],
    featuredProducts: products.map(mapBackendAProductCard),
    quickCategories: Array.from(
      new Map(
        products.map((product) => [
          product.category,
          {
            id: `backend-a-category-${product.category}`,
            imageUrl: null,
            label: product.category,
          },
        ]),
      ).values(),
    ).slice(0, 8),
  }
}

export function mapBackendAProductDetailPageData(
  product: ProductDetail,
  recommendedProducts: ProductSummary[],
): ProductDetailPageData {
  return {
    defaultSkuId: `${product.id}-default`,
    product,
    quantity: 1,
    recommendations: recommendedProducts.map(mapBackendAProductCard),
    review: {
      count: 18,
      rate: 0.96,
    },
    selectedSkuId: `${product.id}-default`,
    skuList: [
      {
        available: product.inventory > 0,
        marketPrice: null,
        price: product.price,
        skuId: `${product.id}-default`,
        specText: '默认规格',
        stock: product.inventory,
      },
    ],
    store: {
      score: {
        deliveryScore: 4.8,
        descriptionScore: 4.9,
        serviceScore: 4.8,
      },
      storeId: 'backend-a-store',
      storeName: 'Backend A 选品馆',
    },
  }
}
