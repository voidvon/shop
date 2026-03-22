import type { MemberHistoryItem, SaveMemberHistoryItem } from './member-history'

export interface MemberHistoryRepository {
  countHistory(): Promise<number>
  getHistory(): Promise<MemberHistoryItem[]>
  removeHistory(productId: string): Promise<MemberHistoryItem[]>
  saveHistory(item: SaveMemberHistoryItem): Promise<MemberHistoryItem[]>
}
