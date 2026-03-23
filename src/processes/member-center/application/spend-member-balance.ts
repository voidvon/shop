import type {
  MemberAssetsService,
  SpendMemberBalanceCommand,
} from '../domain/member-assets-service'

export async function spendMemberBalance(
  service: MemberAssetsService,
  command: SpendMemberBalanceCommand,
) {
  return service.spendBalance(command)
}
