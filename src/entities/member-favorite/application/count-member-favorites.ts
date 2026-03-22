import type { MemberFavoriteRepository } from '../domain/member-favorite-repository'

export async function countMemberFavorites(
  repository: MemberFavoriteRepository,
  userId: string,
) {
  return repository.countFavorites(userId)
}
