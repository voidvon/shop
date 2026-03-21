import {
  getMockProduct,
  getMockStore,
  mockAccountData,
} from '@/shared/mocks'

import type {
  MemberCardBindPageData,
  MemberCardsPageData,
  MemberCenterPageData,
  MemberFavoritesPageData,
  MemberHistoryPageData,
  MemberProductListItem,
} from '../../domain/member-center-page-data'

type MockMemberProductListItem =
  (typeof mockAccountData.memberCollectionsPageData.favoriteProducts)[number]

function mapMockMemberProductListItem(input: MockMemberProductListItem): MemberProductListItem {
  const product = getMockProduct(input.productId)

  return {
    productId: input.productId,
    productImageUrl: input.productImageUrl ?? null,
    productName: input.productName,
    productPrice: input.productPrice,
    storeName: getMockStore(product?.storeId ?? '')?.storeName ?? '默认店铺',
  }
}

export function mapMockMemberCardBindPageData(): MemberCardBindPageData {
  return {
    cardNumber: mockAccountData.cardBindingPageData.cardNumber,
  }
}

export function mapMockMemberCardsPageData(): MemberCardsPageData {
  return {
    balanceAmount: mockAccountData.memberAssetsPageData.balanceAmount,
    cardNumber: mockAccountData.cardBindingPageData.cardNumber,
  }
}

export function mapMockMemberCenterPageData(): MemberCenterPageData {
  return {
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
  }
}

export function mapMockMemberFavoritesPageData(): MemberFavoritesPageData {
  return {
    items: mockAccountData.memberCollectionsPageData.favoriteProducts.map(mapMockMemberProductListItem),
  }
}

export function mapMockMemberHistoryPageData(): MemberHistoryPageData {
  return {
    items: mockAccountData.memberCollectionsPageData.browsingHistory.map(mapMockMemberProductListItem),
  }
}
