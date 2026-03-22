import type { MemberHistoryRepository } from '../domain/member-history-repository'

export async function countMemberHistory(repository: MemberHistoryRepository) {
  return repository.countHistory()
}
