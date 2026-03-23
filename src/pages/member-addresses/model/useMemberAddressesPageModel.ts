import { computed } from 'vue'
import {
  useMemberAddressStore,
  type SaveMemberAddressCommand,
} from '@/entities/member-address'

export function useMemberAddressesPageModel() {
  const memberAddressStore = useMemberAddressStore()
  const errorMessage = computed(() => memberAddressStore.errorMessage)
  const isLoading = computed(() => memberAddressStore.isLoading)
  const memberAddressesPageData = computed(() => ({
    items: memberAddressStore.items,
  }))

  async function loadMemberAddressesPage() {
    await memberAddressStore.syncCurrentUserAddresses({ force: true })
  }

  async function removeAddressItem(addressId: string) {
    await memberAddressStore.removeAddressItem(addressId)
  }

  async function saveAddressItem(command: SaveMemberAddressCommand) {
    await memberAddressStore.saveAddressItem(command)
  }

  return {
    errorMessage,
    isLoading,
    loadMemberAddressesPage,
    memberAddressesPageData,
    removeAddressItem,
    saveAddressItem,
  }
}
