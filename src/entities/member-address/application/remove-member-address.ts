import type { MemberAddressRepository } from '../domain/member-address-repository'

export async function removeMemberAddress(
  repository: MemberAddressRepository,
  addressId: string,
) {
  return repository.removeAddress(addressId)
}
