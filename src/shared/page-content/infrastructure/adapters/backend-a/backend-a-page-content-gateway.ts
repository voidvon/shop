import {
  backendACartRepository,
  createEmptyCartSnapshot,
} from '@/entities/cart'
import { backendAProductRepository } from '@/entities/product'

import type { PageContentGateway } from '../../../domain/page-content-gateway'
import type {
  CartPageData,
  CategoryPageCategory,
  CategoryPageData,
  MemberProductListItem,
  ProductDetailPageData,
} from '../../../domain/page-content'

function mapProductCard(input: {
  category?: string
  coverImageUrl: string | null
  id: string
  name: string
  price: number
}) {
  return {
    id: input.id,
    imageUrl: input.coverImageUrl,
    marketPrice: null,
    name: input.name,
    price: input.price,
  }
}

function createCategoryPageData(
  products: Awaited<ReturnType<typeof backendAProductRepository.getFeaturedProductSummaries>>,
): CategoryPageData {
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

function createHomeQuickCategories(
  products: Awaited<ReturnType<typeof backendAProductRepository.getFeaturedProductSummaries>>,
) {
  return Array.from(
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
  ).slice(0, 8)
}

function createBackendACartPageData(snapshot: Awaited<ReturnType<typeof backendACartRepository.getSnapshot>>): CartPageData {
  return {
    groups: [
      {
        items: snapshot.lines.map((line, index) => ({
          lineId: `backend-a-line-${index + 1}`,
          productId: line.productId,
          productImageUrl: null,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        storeId: 'backend-a-store',
        storeName: 'Backend A 选品馆',
      },
    ],
    totalAmount: snapshot.subtotal,
  }
}

function createMemberProductListItem(input: {
  coverImageUrl: string | null
  id: string
  name: string
  price: number
}): MemberProductListItem {
  return {
    productId: input.id,
    productImageUrl: input.coverImageUrl,
    productName: input.name,
    productPrice: input.price,
    storeName: 'Backend A 选品馆',
  }
}

async function createProductDetailPageData(productId: string): Promise<ProductDetailPageData | null> {
  const product = await backendAProductRepository.getProductDetail(productId)

  if (!product) {
    return null
  }

  const recommendedProducts = (await backendAProductRepository.getFeaturedProductSummaries())
    .filter((item) => item.id !== productId)
    .slice(0, 3)
    .map(mapProductCard)

  return {
    defaultSkuId: `${product.id}-default`,
    product,
    quantity: 1,
    recommendations: recommendedProducts,
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

export const backendAPageContentGateway: PageContentGateway = {
  async getCartPageData() {
    const snapshot = await backendACartRepository.getSnapshot()
    return createBackendACartPageData(snapshot.lines.length > 0 ? snapshot : createEmptyCartSnapshot())
  },

  async getCategoryPageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()
    return createCategoryPageData(products)
  },

  async getHomePageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()

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
      featuredProducts: products.map(mapProductCard),
      quickCategories: createHomeQuickCategories(products),
    }
  },

  async getMemberCardBindPageData() {
    return Promise.resolve({
      cardNumber: 'BA-8899-0011-2233',
    })
  },

  async getMemberCardsPageData() {
    return Promise.resolve({
      balanceAmount: 128.5,
      cardNumber: 'BA-8899-0011-2233',
    })
  },

  async getMemberCenterPageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()
    const favoriteItems = products.slice(0, 2)
    const historyItems = products.slice(0, 3)

    return Promise.resolve({
      counts: {
        browsingCount: historyItems.length,
        cartCount: 1,
        favoritesCount: favoriteItems.length,
      },
      orderSummary: {
        pendingPaymentCount: 1,
        pendingReceiptCount: 0,
        pendingReviewCount: 1,
        pendingShipmentCount: 1,
        refundAndReturnCount: 0,
      },
      profile: {
        avatarUrl: null,
        isLoggedIn: true,
        username: 'Backend A 用户',
      },
      servicePhone: '400-900-2026',
      shortcuts: [
        { key: 'cards', label: '我的卡券', route: '/member/assets/cards' },
        { key: 'payment-code', label: '付款码', route: '/member/assets/payment-code' },
        { key: 'balance', label: '账户余额', route: '/member/assets/balance' },
        { key: 'settings', label: '用户设置', route: '/member/settings' },
      ],
      tipText: '当前页面数据经 Backend A 适配层统一转换。',
    })
  },

  async getMemberFavoritesPageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()

    return Promise.resolve({
      items: products.slice(0, 2).map(createMemberProductListItem),
    })
  },

  async getMemberHistoryPageData() {
    const products = await backendAProductRepository.getFeaturedProductSummaries()

    return Promise.resolve({
      items: products.slice(0, 3).map(createMemberProductListItem),
    })
  },

  async getOrderListPageData() {
    return Promise.resolve({
      keyword: '',
      orders: [
        {
          itemCount: 1,
          items: [
            {
              orderItemId: 'backend-a-order-item-1',
              productImageUrl: null,
              productName: '织面桌面蓝牙音箱',
              quantity: 1,
              unitPrice: 379,
            },
          ],
          orderId: 'backend-a-order-1',
          orderNo: 'BACKENDA20260321001',
          shippingAmount: 0,
          status: 'pending-payment',
          statusText: '待付款',
          storeName: 'Backend A 选品馆',
          totalAmount: 379,
        },
      ],
    })
  },

  async getProductDetailPageData(productId: string) {
    return createProductDetailPageData(productId)
  },
}
