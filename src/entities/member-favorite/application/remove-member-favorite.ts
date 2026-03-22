import type { MemberFavoriteRepository } from '../domain/member-favorite-repository'

export async function removeMemberFavorite(
  repository: MemberFavoriteRepository,
  userId: string,
  productId: string,
) {
  return repository.removeFavorite(userId, productId)
}
