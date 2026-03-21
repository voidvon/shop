import type { ProductSummary } from '@/entities/product'

import type {
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberProductListItem,
} from '../../domain/member-center-page-data'

function mapBackendAMemberProductListItem(product: ProductSummary): MemberProductListItem {
  return {
    productId: product.id,
    productImageUrl: product.coverImageUrl,
    productName: product.name,
    productPrice: product.price,
    storeName: 'Backend A 选品馆',
  }
}

export function mapBackendAMemberCardBindPageData(): MemberCardBindPageData {
  return {
    cardNumber: 'BA-8899-0011-2233',
  }
}

export function mapBackendAMemberCardsPageData(): MemberCardsPageData {
  return {
    balanceAmount: 128.5,
    cardNumber: 'BA-8899-0011-2233',
  }
}

export function mapBackendAMemberCenterPageData(products: ProductSummary[]): MemberCenterPageData {
  const favoriteItems = products.slice(0, 2)
  const historyItems = products.slice(0, 3)

  return {
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
  }
}

export function mapBackendAMemberFavoritesPageData(products: ProductSummary[]): MemberFavoritesPageData {
  return {
    items: products.slice(0, 2).map(mapBackendAMemberProductListItem),
  }
}

export function mapBackendAMemberHistoryPageData(products: ProductSummary[]): MemberHistoryPageData {
  return {
    items: products.slice(0, 3).map(mapBackendAMemberProductListItem),
  }
}
