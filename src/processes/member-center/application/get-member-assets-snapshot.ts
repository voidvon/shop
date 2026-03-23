import type { MemberAssetsService } from '../domain/member-assets-service'

export async function getMemberAssetsSnapshot(service: MemberAssetsService) {
  return service.getSnapshot()
}
