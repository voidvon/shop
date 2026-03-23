import type { MemberAuthSession } from '@/entities/member-auth'
import { createBrowserMemberAssetsRepository } from '../../create-browser-member-assets-repository'
import { createBrowserMemberAssetsService } from '../../create-browser-member-assets-service'
import {
  memberAssetsMockNamespace,
  resolveMemberBalanceLogSeed,
  resolveMemberBalanceSeed,
  resolveMemberCardBindSeed,
  resolveMemberCardRedemptionSeed,
} from '../../member-assets-seeds'

export function createMockMemberAssetsService(memberAuthSession: MemberAuthSession) {
  const repository = createBrowserMemberAssetsRepository({
    getBindPageData: resolveMemberCardBindSeed,
    getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
    getSeedBalance: resolveMemberBalanceSeed,
    getSeedBalanceLogs: resolveMemberBalanceLogSeed,
    getSeedRedemptionRecords: resolveMemberCardRedemptionSeed,
    namespace: memberAssetsMockNamespace,
  })

  return createBrowserMemberAssetsService(repository)
}
