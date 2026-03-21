import { mockProductRepository } from '@/entities/product'
import {
  getMockProduct,
  getMockStore,
  mockAccountData,
  mockCatalogData,
  mockProducts,
  mockPublicData,
  mockTradeData,
} from '@/shared/mocks'

import type { PageContentGateway } from '../../../domain/page-content-gateway'
import type {
  CategoryPageCategory,
  CategoryPageData,
  HomePageData,
  MemberProductListItem,
  OrderListEntry,
  PageProductCard,
  ProductDetailPageData,
} from '../../../domain/page-content'

function mapProductCard(input: {
  price: number
  productId: string
  productImageUrl?: string | null
  productName: string
  marketPrice?: number | null
  imageUrl?: string | null
}) : PageProductCard {
  return {
    id: input.productId,
    imageUrl: input.productImageUrl ?? input.imageUrl ?? null,
    marketPrice: input.marketPrice ?? null,
    name: input.productName,
    price: input.price,
  }
}

function mapOrderEntry(order: (typeof mockTradeData.orderCenterPageData.orderPage.list)[number]): OrderListEntry {
  return {
    itemCount: order.itemCount,
    items: order.items.map((item) => ({
      orderItemId: item.orderItemId,
      productImageUrl: item.productImageUrl,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    orderId: order.orderId,
    orderNo: order.orderNo,
    shippingAmount: order.shippingAmount,
    status: order.status,
    statusText: order.statusText,
    storeName: order.storeName,
    totalAmount: order.totalAmount,
  }
}

function mapCategoryTree(
  categories: (typeof mockCatalogData.categoryEntryPageData.primaryCategories),
): CategoryPageCategory[] {
  return categories.map((category) => ({
    children: mapCategoryTree(category.children),
    id: category.categoryId,
    imageUrl: category.imageUrl,
    label: category.categoryName,
  }))
}

function mapMemberProductListItem(input: {
  productId: string
  productImageUrl: string
  productName: string
  productPrice: number
}): MemberProductListItem {
  const product = getMockProduct(input.productId)

  return {
    productId: input.productId,
    productImageUrl: input.productImageUrl ?? null,
    productName: input.productName,
    productPrice: input.productPrice,
    storeName: getMockStore(product?.storeId ?? '')?.storeName ?? '默认店铺',
  }
}

async function createProductDetailPageData(productId: string): Promise<ProductDetailPageData | null> {
  const product = await mockProductRepository.getProductDetail(productId)
  const pageData = mockCatalogData.productDetailPageDataById[productId]

  if (!product || !pageData) {
    return null
  }

  return {
    defaultSkuId: pageData.defaultSkuId,
    product,
    quantity: Math.max(pageData.quantity, 1),
    recommendations: pageData.recommendations.map(mapProductCard),
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

const homePageData: HomePageData = {
  banners: mockPublicData.homePageData.banners.map((banner) => ({
    description: banner.description ?? '',
    eyebrow: banner.eyebrow ?? '',
    imageUrl: banner.imageUrl ?? null,
    linkUrl: banner.linkUrl,
    title: banner.title ?? '',
  })),
  featuredProducts: mockPublicData.homePageData.productFeed.list.slice(0, 4).map(mapProductCard),
  quickCategories: mockPublicData.homePageData.categoryEntries.map((category) => ({
    id: category.categoryId,
    imageUrl: category.imageUrl,
    label: category.categoryName,
  })),
}

const categoryPageData: CategoryPageData = {
  primaryCategories: mapCategoryTree(mockCatalogData.categoryEntryPageData.primaryCategories),
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

export const mockPageContentGateway: PageContentGateway = {
  async getCartPageData() {
    return Promise.resolve({
      groups: mockTradeData.cartPageData.groups.map((group) => ({
        items: group.items.map((item) => ({
          lineId: item.lineId,
          productId: item.productId,
          productImageUrl: item.productImageUrl,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        storeId: group.storeId,
        storeName: group.storeName,
      })),
      totalAmount: mockTradeData.cartPageData.totalAmount,
    })
  },

  async getCategoryPageData() {
    return Promise.resolve(categoryPageData)
  },

  async getHomePageData() {
    return Promise.resolve(homePageData)
  },

  async getMemberCardBindPageData() {
    return Promise.resolve({
      cardNumber: mockAccountData.cardBindingPageData.cardNumber,
    })
  },

  async getMemberCardsPageData() {
    return Promise.resolve({
      balanceAmount: mockAccountData.memberAssetsPageData.balanceAmount,
      cardNumber: mockAccountData.cardBindingPageData.cardNumber,
    })
  },

  async getMemberCenterPageData() {
    return Promise.resolve({
      counts: {
        ...mockAccountData.memberCenterPageData.counts,
        browsingCount: mockAccountData.memberCollectionsPageData.browsingHistory.length,
        favoritesCount: mockAccountData.memberCollectionsPageData.favoriteProducts.length,
      },
      orderSummary: { ...mockAccountData.memberCenterPageData.orderSummary },
      profile: { ...mockAccountData.memberCenterPageData.profile },
      servicePhone: mockAccountData.memberCenterPageData.servicePhone ?? '',
      shortcuts: mockAccountData.memberCenterPageData.shortcuts.map((shortcut) => ({ ...shortcut })),
      tipText: mockAccountData.memberCenterPageData.tipText ?? '',
    })
  },

  async getMemberFavoritesPageData() {
    return Promise.resolve({
      items: mockAccountData.memberCollectionsPageData.favoriteProducts.map(mapMemberProductListItem),
    })
  },

  async getMemberHistoryPageData() {
    return Promise.resolve({
      items: mockAccountData.memberCollectionsPageData.browsingHistory.map(mapMemberProductListItem),
    })
  },

  async getOrderListPageData() {
    return Promise.resolve({
      keyword: mockTradeData.orderCenterPageData.query.keyword,
      orders: mockTradeData.orderCenterPageData.orderPage.list.map(mapOrderEntry),
    })
  },

  async getProductDetailPageData(productId: string) {
    return createProductDetailPageData(productId)
  },
}
