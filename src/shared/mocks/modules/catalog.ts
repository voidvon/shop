import type {
  CategoryEntryPageData,
  CategoryListPageData,
  ProductDetailPageData,
  ProductEvaluationPageData,
  ProductInfoPageData,
  ProductListPageData,
} from '@/shared/types/modules'

import { allowActions, createPageResult, getMockStore, mockCategoryTree, mockImageUrl, mockProducts } from './core'

const allProducts = mockProducts.map((product) => {
  const store = getMockStore(product.storeId)

  if (!store) {
    throw new Error(`Missing mock store for product: ${product.productId}`)
  }

  return {
    hasGift: product.productId === 'prod-tea-gift-box',
    isFCode: product.isFCode,
    isFlashSale: product.isFlashSale,
    isGroupBuy: product.isGroupBuy,
    isOwnShop: product.isOwnShop,
    isPresell: product.isPresell,
    isVirtual: product.isVirtual,
    marketPrice: product.marketPrice,
    price: product.price,
    productId: product.productId,
    productImageUrl: product.imageUrl,
    productName: product.productName,
    skuId: product.skuList[0]?.skuId ?? null,
    storeId: store.storeId,
    storeName: store.storeName,
  }
})

export const mockCategoryEntryPageData: CategoryEntryPageData = {
  brandRecommendations: [
    { brandId: 'brand-city-craft', brandImageUrl: mockImageUrl, brandName: '城艺造物' },
    { brandId: 'brand-homelab', brandImageUrl: mockImageUrl, brandName: 'HomeLab' },
    { brandId: 'brand-chushi', brandImageUrl: mockImageUrl, brandName: '楚食记' },
  ],
  primaryCategories: mockCategoryTree,
}

export const mockCategoryListPageData: CategoryListPageData = {
  primaryCategories: mockCategoryTree,
  productPage: createPageResult(allProducts.filter((product) => product.storeId !== 'store-food-story'), 1, 10, 14),
  query: {
    page: 1,
    pageSize: 10,
    primaryCategoryId: 'cat-home',
    secondaryCategoryId: 'cat-home-lighting',
  },
  secondaryCategories: mockCategoryTree.find((category) => category.categoryId === 'cat-home')?.children ?? [],
  selectedPrimaryCategoryId: 'cat-home',
  selectedSecondaryCategoryId: 'cat-home-lighting',
}

export const mockProductListPageData: ProductListPageData = {
  productPage: createPageResult(allProducts, 1, 10, 16),
  query: {
    displayMode: 'grid',
    filters: {
      areaId: null,
      brandId: null,
      categoryId: null,
      flashSaleOnly: false,
      giftOnly: false,
      groupBuyOnly: false,
      keyword: '文创',
      ownShopOnly: false,
      priceFrom: null,
      priceTo: null,
      virtualOnly: false,
    },
    page: 1,
    pageSize: 10,
    sortKey: 'default',
  },
}

export const mockProductDetailPageDataById: Record<string, ProductDetailPageData> = Object.fromEntries(
  mockProducts.map((product) => {
    const store = getMockStore(product.storeId)

    if (!store) {
      throw new Error(`Missing mock store for product detail: ${product.productId}`)
    }

    const defaultSku = product.skuList[0] ?? null

    return [
      product.productId,
      {
        actions: allowActions(['add-to-cart', 'buy-now', 'favorite']),
        amountDetails: [
          { amount: product.price, code: 'goods', direction: 'increase', label: '商品金额' },
          ...(product.marketPrice && product.marketPrice > product.price
            ? [{ amount: product.marketPrice - product.price, code: 'discount', direction: 'decrease' as const, label: '促销优惠' }]
            : []),
        ],
        coupons: [
          { couponId: `coupon-${product.productId}`, couponName: '店铺满减券', discountAmount: 20 },
        ],
        defaultSkuId: defaultSku?.skuId ?? null,
        gallery: [...product.gallery],
        marketPrice: product.marketPrice,
        price: product.price,
        productId: product.productId,
        productName: product.productName,
        quantity: 1,
        recommendations: mockProducts
          .filter((candidate) => candidate.productId !== product.productId)
          .slice(0, 3)
          .map((candidate) => ({
            price: candidate.price,
            productId: candidate.productId,
            productImageUrl: candidate.imageUrl,
            productName: candidate.productName,
          })),
        reviewCount: 36,
        reviewRate: 0.97,
        reviewSnippets: [
          { content: '做工很稳，包装也细致。', createdAt: '2026-03-10 13:22:00', score: 5, username: '文旅客' },
          { content: '适合送礼，整体质感不错。', createdAt: '2026-03-12 09:18:00', score: 5, username: '城里人' },
        ],
        selectedSkuId: defaultSku?.skuId ?? null,
        sellingPoints: [...product.sellingPoints],
        skuList: product.skuList.map((sku) => ({
          available: sku.stock > 0,
          marketPrice: sku.marketPrice,
          price: sku.price,
          skuId: sku.skuId,
          specText: sku.specText,
          stock: sku.stock,
        })),
        specGroups: product.specs.map((specGroup, specIndex) => ({
          groupId: specGroup.groupId,
          groupLabel: specGroup.groupLabel,
          values: specGroup.values.map((value, valueIndex) => ({
            isSelected: specIndex === 0 && valueIndex === 0,
            valueId: value.valueId,
            valueLabel: value.valueLabel,
          })),
        })),
        stock: product.inventory,
        store: {
          address: store.address,
          businessHours: store.businessHours,
          isOwnShop: store.isOwnShop,
          phone: store.phone,
          score: {
            deliveryScore: 4.8,
            descriptionScore: 4.9,
            serviceScore: 4.9,
          },
          storeId: store.storeId,
          storeName: store.storeName,
        },
        subtitle: product.subtitle,
      },
    ]
  }),
)

export const mockProductInfoPageDataById: Record<string, ProductInfoPageData> = Object.fromEntries(
  mockProducts.map((product) => [
    product.productId,
    {
      htmlContent: product.htmlContent,
      productId: product.productId,
    },
  ]),
)

export const mockProductEvaluationPageDataById: Record<string, ProductEvaluationPageData> = Object.fromEntries(
  mockProducts.map((product) => [
    product.productId,
    {
      evaluationPage: createPageResult([
        {
          appendContent: '又回购了一次，送朋友也很合适。',
          appendCreatedAt: '2026-03-16 18:00:00',
          appendExplanation: null,
          appendImageThumbUrls: [mockImageUrl],
          appendImageUrls: [mockImageUrl],
          content: '实物比图片更细致，细节处理到位。',
          createdAt: '2026-03-09 10:20:00',
          evaluationId: `${product.productId}-eval-1`,
          explanation: '感谢支持，欢迎再次光临。',
          imageThumbUrls: [mockImageUrl],
          imageUrls: [mockImageUrl],
          memberAvatarUrl: mockImageUrl,
          memberName: '湖畔用户',
          score: 5,
        },
        {
          appendContent: null,
          appendCreatedAt: null,
          appendExplanation: null,
          appendImageThumbUrls: [],
          appendImageUrls: [],
          content: '包装很好，物流速度也快。',
          createdAt: '2026-03-11 08:40:00',
          evaluationId: `${product.productId}-eval-2`,
          explanation: null,
          imageThumbUrls: [],
          imageUrls: [],
          memberAvatarUrl: mockImageUrl,
          memberName: '城市访客',
          score: 4,
        },
      ], 1, 10, 24),
      filter: 'all',
      productId: product.productId,
    },
  ]),
)

export const mockCatalogData = {
  categoryEntryPageData: mockCategoryEntryPageData,
  categoryListPageData: mockCategoryListPageData,
  productDetailPageDataById: mockProductDetailPageDataById,
  productEvaluationPageDataById: mockProductEvaluationPageDataById,
  productInfoPageDataById: mockProductInfoPageDataById,
  productListPageData: mockProductListPageData,
}
