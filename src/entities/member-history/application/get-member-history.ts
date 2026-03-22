import type { MemberHistoryRepository } from '../domain/member-history-repository'

export async function getMemberHistory(repository: MemberHistoryRepository) {
  return repository.getHistory()
}
