import type { SaveMemberAddressCommand } from '../domain/member-address'
import type { MemberAddressRepository } from '../domain/member-address-repository'

export async function saveMemberAddress(
  repository: MemberAddressRepository,
  command: SaveMemberAddressCommand,
) {
  return repository.saveAddress(command)
}
