import type { SaveMemberHistoryItem } from '../domain/member-history'
import type { MemberHistoryRepository } from '../domain/member-history-repository'

export async function saveMemberHistory(
  repository: MemberHistoryRepository,
  item: SaveMemberHistoryItem,
) {
  return repository.saveHistory(item)
}
