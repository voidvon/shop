import { ref } from 'vue'

import { useMemberAuthSession } from '@/entities/member-auth'
import {
  createBrowserMemberAddressRepository,
  getMemberAddresses,
  removeMemberAddress,
  saveMemberAddress,
  type MemberAddress,
  type SaveMemberAddressCommand,
} from '@/entities/member-address'

interface MemberAddressesPageData {
  items: MemberAddress[]
}

const emptyMemberAddressesPageData: MemberAddressesPageData = {
  items: [],
}

export function useMemberAddressesPageModel() {
  const memberAuthSession = useMemberAuthSession()
  const memberAddressRepository = createBrowserMemberAddressRepository({
    getScopeKey: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? 'guest',
  })

  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const memberAddressesPageData = ref<MemberAddressesPageData>(emptyMemberAddressesPageData)

  async function loadMemberAddressesPage() {
    isLoading.value = true
    errorMessage.value = null

    try {
      memberAddressesPageData.value = {
        items: await getMemberAddresses(memberAddressRepository),
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '地址管理页加载失败'
    } finally {
      isLoading.value = false
    }
  }

  async function removeAddressItem(addressId: string) {
    memberAddressesPageData.value = {
      items: await removeMemberAddress(memberAddressRepository, addressId),
    }
  }

  async function saveAddressItem(command: SaveMemberAddressCommand) {
    memberAddressesPageData.value = {
      items: await saveMemberAddress(memberAddressRepository, command),
    }
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
