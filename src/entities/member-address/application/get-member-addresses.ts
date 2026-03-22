import type { MemberAddressRepository } from '../domain/member-address-repository'

export async function getMemberAddresses(repository: MemberAddressRepository) {
  return repository.getAddresses()
}
