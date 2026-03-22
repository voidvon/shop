import type { MemberFavoriteRepository } from '../domain/member-favorite-repository'

export async function hasMemberFavorite(
  repository: MemberFavoriteRepository,
  userId: string,
  productId: string,
) {
  return repository.hasFavorite(userId, productId)
}
