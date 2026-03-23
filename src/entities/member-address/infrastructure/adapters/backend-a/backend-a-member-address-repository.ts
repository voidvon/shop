import { createBackendAHttpClient } from '@/shared/api/backend-a/backend-a-http-client'

import type { MemberAddressRepository } from '../../../domain/member-address-repository'
import type { MemberAuthSession } from '@/entities/member-auth'
import type { BackendAUserAddressDto } from '../../dto/backend-a-member-address.dto'
import {
  mapBackendAUserAddressDto,
  mapSaveMemberAddressCommandToBackendADto,
  normalizeBackendAAddressCollection,
} from '../../mappers/backend-a-member-address-mapper'

function createBackendAMemberAddressHttpClient(memberAuthSession: MemberAuthSession) {
  return createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })
}

export function createBackendAMemberAddressRepository(
  memberAuthSession: MemberAuthSession,
): MemberAddressRepository {
  const httpClient = createBackendAMemberAddressHttpClient(memberAuthSession)

  async function fetchAddresses() {
    const response = await httpClient.get<unknown>('/api/v1/user-addresses')
    return normalizeBackendAAddressCollection(response).map(mapBackendAUserAddressDto)
  }

  return {
    async getAddresses() {
      return fetchAddresses()
    },

    async removeAddress(addressId) {
      await httpClient.delete<unknown>(`/api/v1/user-addresses/${encodeURIComponent(addressId)}`)
      return fetchAddresses()
    },

    async saveAddress(command) {
      const payload = mapSaveMemberAddressCommandToBackendADto(command)

      if (command.id) {
        await httpClient.patch<BackendAUserAddressDto>(
          `/api/v1/user-addresses/${encodeURIComponent(command.id)}`,
          payload,
        )
      } else {
        await httpClient.post<BackendAUserAddressDto>(
          '/api/v1/user-addresses',
          payload,
        )
      }

      return fetchAddresses()
    },
  }
}
