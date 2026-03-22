import type { MemberFavoriteRepository } from '../domain/member-favorite-repository'

export async function getMemberFavorites(
  repository: MemberFavoriteRepository,
  userId: string,
) {
  return repository.getFavorites(userId)
}
