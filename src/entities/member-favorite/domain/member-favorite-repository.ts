import type { MemberFavoriteItem } from './member-favorite'

export interface MemberFavoriteRepository {
  countFavorites(userId: string): Promise<number>
  getFavorites(userId: string): Promise<MemberFavoriteItem[]>
  hasFavorite(userId: string, productId: string): Promise<boolean>
  removeFavorite(userId: string, productId: string): Promise<MemberFavoriteItem[]>
  saveFavorite(userId: string, item: MemberFavoriteItem): Promise<MemberFavoriteItem[]>
}
