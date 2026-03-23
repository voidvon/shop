import type { MemberAuthSession } from '@/entities/member-auth'
import type { MemberAssetsService } from '../../../domain/member-assets-service'
import { createBrowserMemberAssetsRepository } from '../../create-browser-member-assets-repository'
import { createBackendAMemberAssetsGatewayFromEnv } from './backend-a-member-assets-http-gateway'
import {
  mapBackendAMemberAssetsSnapshot,
  mapBackendABindMemberCardResult,
  mapBackendASpendBalanceResult,
} from './backend-a-member-assets-mapper'
import {
  backendAMemberAssetsNamespace,
  resolveBackendAMemberBalanceLogSeed,
  resolveBackendAMemberBalanceSeed,
  resolveBackendAMemberCardBindSeed,
  resolveBackendAMemberCardRedemptionSeed,
} from './backend-a-member-assets-seeds'
import {
  createStubBackendAMemberAssetsGateway,
  mapBindMemberCardCommand,
  mapSpendMemberBalanceCommand,
} from './backend-a-member-assets-gateway'

export function createBackendAMemberAssetsService(memberAuthSession: MemberAuthSession): MemberAssetsService {
  const repository = createBrowserMemberAssetsRepository({
    getBindPageData: resolveBackendAMemberCardBindSeed,
    getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
    getSeedBalance: resolveBackendAMemberBalanceSeed,
    getSeedBalanceLogs: resolveBackendAMemberBalanceLogSeed,
    getSeedRedemptionRecords: resolveBackendAMemberCardRedemptionSeed,
    namespace: backendAMemberAssetsNamespace,
  })
  const gateway = createBackendAMemberAssetsGatewayFromEnv(memberAuthSession)
    ?? createStubBackendAMemberAssetsGateway(repository)

  return {
    async bindMemberCard(command) {
      const response = await gateway.bindMemberCard(mapBindMemberCardCommand(command))
      return mapBackendABindMemberCardResult(response)
    },

    async getSnapshot() {
      const response = await gateway.getSnapshot()
      return mapBackendAMemberAssetsSnapshot(response)
    },

    async spendBalance(command) {
      const response = await gateway.spendBalance(mapSpendMemberBalanceCommand(command))
      return mapBackendASpendBalanceResult(response)
    },
  }
}
