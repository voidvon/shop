export interface MemberHistoryItem {
  productId: string
  productImageUrl: string | null
  productName: string
  productPrice: number
  storeName: string
  viewedAt: number
}

export type SaveMemberHistoryItem = Omit<MemberHistoryItem, 'viewedAt'>
