import type {
  MemberAddress,
  SaveMemberAddressCommand,
} from '../../domain/member-address'
import type { BackendAUserAddressDto } from '../dto/backend-a-member-address.dto'

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

export function mapBackendAUserAddressDto(
  dto: BackendAUserAddressDto,
): MemberAddress {
  const province = normalizeText(dto.province)
  const city = normalizeText(dto.city)
  const county = normalizeText(dto.district)
  const now = Date.now()

  return {
    addressDetail: dto.street,
    areaCode: '',
    city,
    county,
    createdAt: now,
    id: String(dto.id),
    isDefault: dto.is_default === 1,
    province,
    recipientMobile: dto.mobile,
    recipientName: dto.consignee_name,
    updatedAt: now,
  }
}

export function mapSaveMemberAddressCommandToBackendADto(
  command: SaveMemberAddressCommand,
) {
  return {
    city: normalizeText(command.city) || undefined,
    consignee_name: command.recipientName,
    district: normalizeText(command.county) || undefined,
    is_default: command.isDefault ? 1 : 0,
    mobile: command.recipientMobile,
    postal_code: normalizeText(command.areaCode) || undefined,
    province: normalizeText(command.province) || undefined,
    street: command.addressDetail,
  }
}

export function normalizeBackendAAddressCollection(
  value: unknown,
): BackendAUserAddressDto[] {
  if (Array.isArray(value)) {
    return value as BackendAUserAddressDto[]
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const candidate = value as {
    data?: unknown
    items?: unknown
    list?: unknown
  }

  if (Array.isArray(candidate.data)) {
    return candidate.data as BackendAUserAddressDto[]
  }

  if (Array.isArray(candidate.items)) {
    return candidate.items as BackendAUserAddressDto[]
  }

  if (Array.isArray(candidate.list)) {
    return candidate.list as BackendAUserAddressDto[]
  }

  return []
}
