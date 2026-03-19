import type { HomePageData, SearchPageData, SpecialPageData, StoreAreaPageData, StoreHomeData } from '@/shared/types/modules'

import {
  createCursorPageResult,
  getMockStore,
  mockCategoryTree,
  mockImageUrl,
  mockProducts,
  mockStores,
} from './core'

export const mockHomePageData: HomePageData = {
  banners: [
    { imageUrl: mockImageUrl, linkUrl: '/special/spring-art' },
    { imageUrl: mockImageUrl, linkUrl: '/special/city-gift' },
  ],
  categoryEntries: mockCategoryTree.map((category) => ({
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    imageUrl: category.imageUrl,
  })),
  productFeed: createCursorPageResult(
    mockProducts.map((product) => ({
      marketPrice: product.marketPrice,
      price: product.price,
      productId: product.productId,
      productImageUrl: product.imageUrl,
      productName: product.productName,
    })),
    'home-feed-page-2',
  ),
}

export const mockSearchPageData: SearchPageData = {
  historyKeywords: ['礼盒', '陶瓷杯', '台灯'],
  hotKeywords: ['文惠卡', '春日礼盒', '办公好物', '城市文创'],
}

export const mockStoreAreaPageData: StoreAreaPageData = {
  areas: [
    { areaId: 'area-jianghan', areaName: '江汉区' },
    { areaId: 'area-wuchang', areaName: '武昌区' },
    { areaId: 'area-hanyang', areaName: '汉阳区' },
  ],
  selectedAreaId: 'area-jianghan',
  storeFeed: createCursorPageResult(
    mockStores
      .filter((store) => store.areaId === 'area-jianghan')
      .map((store) => ({
        address: store.address,
        businessHours: store.businessHours,
        phone: store.phone,
        storeId: store.storeId,
        storeName: store.storeName,
      })),
  ),
}

const homeStore = getMockStore('store-art-house')

if (!homeStore) {
  throw new Error('Missing mock store: store-art-house')
}

export const mockStoreHomeData: StoreHomeData = {
  benefitTips: [...homeStore.benefitTips],
  followerCount: homeStore.followerCount,
  isFavorited: true,
  recommendedProducts: mockProducts
    .filter((product) => product.storeId === homeStore.storeId)
    .map((product) => ({
      price: product.price,
      productId: product.productId,
      productImageUrl: product.imageUrl,
      productName: product.productName,
    })),
  storeId: homeStore.storeId,
  storeLogoUrl: homeStore.logoUrl,
  storeName: homeStore.storeName,
  tabs: ['home', 'all-products', 'new-products', 'promotions'],
}

export const mockSpecialPageData: SpecialPageData = {
  modules: [
    {
      items: [
        { imageUrl: mockImageUrl, linkUrl: '/product/prod-canvas-bag', title: '春日通勤好物' },
        { imageUrl: mockImageUrl, linkUrl: '/product/prod-tea-gift-box', title: '城市礼遇礼盒' },
      ],
      title: '焦点推荐',
      type: 'carousel',
    },
    {
      item: { imageUrl: mockImageUrl, linkUrl: '/special/city-gift', title: '城市灵感专题' },
      title: '单图模块',
      type: 'single-image',
    },
    {
      items: [
        { imageUrl: mockImageUrl, linkUrl: '/product/prod-canvas-bag', title: '轻旅帆布通勤包' },
        { imageUrl: mockImageUrl, linkUrl: '/product/prod-ceramic-cup', title: '手冲陶瓷分享杯' },
        { imageUrl: mockImageUrl, linkUrl: '/product/prod-desk-lamp', title: '折幕工作台灯' },
      ],
      title: '店主推荐',
      type: 'triple-image',
    },
    {
      items: mockProducts.map((product) => ({
        originalPrice: product.marketPrice,
        productId: product.productId,
        productImageUrl: product.imageUrl,
        productName: product.productName,
        promotionPrice: product.price,
      })),
      title: '专题商品',
      type: 'product-list',
    },
    {
      countdown: { days: 1, hours: 8, minutes: 30, seconds: 0 },
      title: '限时活动',
      type: 'countdown',
    },
  ],
}

export const mockPublicData = {
  homePageData: mockHomePageData,
  searchPageData: mockSearchPageData,
  specialPageData: mockSpecialPageData,
  storeAreaPageData: mockStoreAreaPageData,
  storeHomeData: mockStoreHomeData,
}
