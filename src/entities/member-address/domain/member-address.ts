export interface MemberAddress {
  id: string
  recipientName: string
  recipientMobile: string
  province: string
  city: string
  county: string
  areaCode: string
  addressDetail: string
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface SaveMemberAddressCommand {
  id?: string
  recipientName: string
  recipientMobile: string
  province: string
  city: string
  county: string
  areaCode: string
  addressDetail: string
  isDefault: boolean
}
