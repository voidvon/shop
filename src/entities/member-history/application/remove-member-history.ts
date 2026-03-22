import type { MemberHistoryRepository } from '../domain/member-history-repository'

export async function removeMemberHistory(
  repository: MemberHistoryRepository,
  productId: string,
) {
  return repository.removeHistory(productId)
}
