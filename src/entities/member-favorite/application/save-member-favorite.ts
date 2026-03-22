import type { MemberFavoriteItem } from '../domain/member-favorite'
import type { MemberFavoriteRepository } from '../domain/member-favorite-repository'

export async function saveMemberFavorite(
  repository: MemberFavoriteRepository,
  userId: string,
  item: MemberFavoriteItem,
) {
  return repository.saveFavorite(userId, item)
}
