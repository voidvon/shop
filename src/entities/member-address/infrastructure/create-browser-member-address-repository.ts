import type {
  MemberAddress,
  SaveMemberAddressCommand,
} from '../domain/member-address'
import type { MemberAddressRepository } from '../domain/member-address-repository'

interface CreateBrowserMemberAddressRepositoryOptions {
  getScopeKey?: () => string
}

const memberAddressStoragePrefix = 'shop.member-addresses'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createMemberAddressStorageKey(scopeKey: string) {
  return `${memberAddressStoragePrefix}.${scopeKey}`
}

function createAddressId() {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeStoredMemberAddress(value: unknown): MemberAddress | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<MemberAddress>

  if (
    typeof candidate.id !== 'string'
    || typeof candidate.recipientName !== 'string'
    || typeof candidate.recipientMobile !== 'string'
    || typeof candidate.addressDetail !== 'string'
  ) {
    return null
  }

  return {
    areaCode: typeof candidate.areaCode === 'string' ? candidate.areaCode : '',
    addressDetail: candidate.addressDetail,
    city: typeof candidate.city === 'string' ? candidate.city : '',
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : Date.now(),
    county: typeof candidate.county === 'string' ? candidate.county : '',
    id: candidate.id,
    isDefault: candidate.isDefault === true,
    province: typeof candidate.province === 'string' ? candidate.province : '',
    recipientMobile: candidate.recipientMobile,
    recipientName: candidate.recipientName,
    updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : Date.now(),
  }
}

function sortAddresses(items: MemberAddress[]) {
  return [...items].sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1
    }

    return right.updatedAt - left.updatedAt
  })
}

function ensureSingleDefaultAddress(
  items: MemberAddress[],
  preferredAddressId?: string,
) {
  if (items.length === 0) {
    return []
  }

  const existingDefaultAddressId = items.find((item) => item.isDefault)?.id
  const resolvedDefaultAddressId = preferredAddressId
    ?? existingDefaultAddressId
    ?? items[0]?.id

  return items.map((item) => ({
    ...item,
    isDefault: item.id === resolvedDefaultAddressId,
  }))
}

function readStoredAddresses(scopeKey: string) {
  if (!canUseStorage()) {
    return []
  }

  const storageKey = createMemberAddressStorageKey(scopeKey)
  const storedValue = window.localStorage.getItem(storageKey)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown

    if (!Array.isArray(parsedValue)) {
      window.localStorage.removeItem(storageKey)
      return []
    }

    return sortAddresses(
      ensureSingleDefaultAddress(
        parsedValue
          .map(normalizeStoredMemberAddress)
          .filter((item): item is MemberAddress => Boolean(item)),
      ),
    )
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

function writeStoredAddresses(scopeKey: string, items: MemberAddress[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    createMemberAddressStorageKey(scopeKey),
    JSON.stringify(sortAddresses(items)),
  )
}

function resolvePreferredAddressIdAfterSave(
  items: MemberAddress[],
  nextAddress: MemberAddress,
) {
  if (nextAddress.isDefault || items.length === 1) {
    return nextAddress.id
  }

  return items.find((item) => item.id !== nextAddress.id && item.isDefault)?.id
    ?? items.find((item) => item.id !== nextAddress.id)?.id
    ?? nextAddress.id
}

export function createBrowserMemberAddressRepository(
  options: CreateBrowserMemberAddressRepositoryOptions = {},
): MemberAddressRepository {
  function resolveScopeKey() {
    return options.getScopeKey?.() ?? 'guest'
  }

  return {
    async getAddresses() {
      return readStoredAddresses(resolveScopeKey())
    },

    async removeAddress(addressId) {
      const scopeKey = resolveScopeKey()
      const nextAddresses = ensureSingleDefaultAddress(
        readStoredAddresses(scopeKey).filter((item) => item.id !== addressId),
      )

      writeStoredAddresses(scopeKey, nextAddresses)

      return sortAddresses(nextAddresses)
    },

    async saveAddress(command: SaveMemberAddressCommand) {
      const scopeKey = resolveScopeKey()
      const currentAddresses = readStoredAddresses(scopeKey)
      const existingAddress = currentAddresses.find((item) => item.id === command.id)
      const now = Date.now()
      const nextAddress: MemberAddress = {
        areaCode: command.areaCode,
        addressDetail: command.addressDetail,
        city: command.city,
        createdAt: existingAddress?.createdAt ?? now,
        county: command.county,
        id: existingAddress?.id ?? createAddressId(),
        isDefault: command.isDefault,
        province: command.province,
        recipientMobile: command.recipientMobile,
        recipientName: command.recipientName,
        updatedAt: now,
      }

      const mergedAddresses = existingAddress
        ? currentAddresses.map((item) => (item.id === nextAddress.id ? nextAddress : item))
        : [nextAddress, ...currentAddresses]
      const nextAddresses = ensureSingleDefaultAddress(
        mergedAddresses,
        resolvePreferredAddressIdAfterSave(mergedAddresses, nextAddress),
      )

      writeStoredAddresses(scopeKey, nextAddresses)

      return sortAddresses(nextAddresses)
    },
  }
}
