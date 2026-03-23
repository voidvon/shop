import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useMemberAuthSession } from '@/entities/member-auth'

import { getMemberAddresses } from '../application/get-member-addresses'
import { removeMemberAddress } from '../application/remove-member-address'
import { saveMemberAddress } from '../application/save-member-address'
import type { MemberAddress, SaveMemberAddressCommand } from '../domain/member-address'
import { useMemberAddressRepository } from '../infrastructure/member-address-repository-provider'

export const useMemberAddressStore = defineStore('member-address', () => {
  const memberAuthSession = useMemberAuthSession()
  const memberAddressRepository = useMemberAddressRepository()

  const currentUserId = ref(memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? null)
  const errorMessage = ref<string | null>(null)
  const hasLoaded = ref(false)
  const isLoading = ref(false)
  const items = ref<MemberAddress[]>([])

  function resetAddresses() {
    items.value = []
    errorMessage.value = null
    hasLoaded.value = false
    isLoading.value = false
  }

  function getAddressById(addressId: string) {
    return items.value.find((item) => item.id === addressId) ?? null
  }

  function resolveSelectedAddress(preferredAddressId?: string) {
    const preferredAddress = preferredAddressId ? getAddressById(preferredAddressId) : null

    return preferredAddress
      ?? items.value.find((item) => item.isDefault)
      ?? items.value[0]
      ?? null
  }

  async function syncCurrentUserAddresses(options?: { force?: boolean }) {
    const userId = currentUserId.value

    if (!userId) {
      resetAddresses()
      hasLoaded.value = true
      return items.value
    }

    if (hasLoaded.value && !options?.force) {
      return items.value
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      items.value = await getMemberAddresses(memberAddressRepository)
      hasLoaded.value = true
      return items.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '地址数据同步失败'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function saveAddressItem(command: SaveMemberAddressCommand) {
    errorMessage.value = null

    try {
      items.value = await saveMemberAddress(memberAddressRepository, command)
      hasLoaded.value = true
      return items.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '地址保存失败'
      throw error
    }
  }

  async function removeAddressItem(addressId: string) {
    errorMessage.value = null

    try {
      items.value = await removeMemberAddress(memberAddressRepository, addressId)
      hasLoaded.value = true
      return items.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '地址删除失败'
      throw error
    }
  }

  memberAuthSession.subscribe((snapshot) => {
    const nextUserId = snapshot.authResult?.userInfo.userId ?? null

    if (nextUserId === currentUserId.value) {
      return
    }

    currentUserId.value = nextUserId

    if (!nextUserId) {
      resetAddresses()
      hasLoaded.value = true
      return
    }

    void syncCurrentUserAddresses({ force: true })
  })

  if (currentUserId.value) {
    void syncCurrentUserAddresses()
  } else {
    hasLoaded.value = true
  }

  return {
    currentUserId,
    errorMessage,
    getAddressById,
    hasLoaded,
    isLoading,
    items,
    removeAddressItem,
    resolveSelectedAddress,
    saveAddressItem,
    syncCurrentUserAddresses,
  }
})
