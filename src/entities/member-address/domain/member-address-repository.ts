import type { MemberAddress, SaveMemberAddressCommand } from './member-address'

export interface MemberAddressRepository {
  getAddresses(): Promise<MemberAddress[]>
  removeAddress(addressId: string): Promise<MemberAddress[]>
  saveAddress(command: SaveMemberAddressCommand): Promise<MemberAddress[]>
}
