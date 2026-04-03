<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AddressEdit,
  AddressList,
  showConfirmDialog,
  showSuccessToast,
  showToast,
} from 'vant'
import 'vant/es/address-edit/style'
import 'vant/es/address-list/style'

import {
  addressAreaList,
  type MemberAddress,
  type SaveMemberAddressCommand,
} from '@/entities/member-address'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberAddressesPageModel } from '../model/useMemberAddressesPageModel'

interface AddressListItemView {
  id: string
  name: string
  tel: string
  address: string
  isDefault: boolean
  province: string
  city: string
  county: string
  areaCode: string
  addressDetail: string
}

interface AddressEditorInfo {
  name?: string
  tel?: string
  province?: string
  city?: string
  county?: string
  areaCode?: string
  addressDetail?: string
  isDefault?: boolean
}

const route = useRoute()
const router = useRouter()
const editorRenderKey = ref(0)
const editingAddressId = ref<string | null>(null)
const editorInfo = ref<AddressEditorInfo>({})
const editorRouteKey = ref('')
const selectedAddressId = ref<string>('')

const {
  errorMessage,
  isLoading,
  loadMemberAddressesPage,
  memberAddressesPageData,
  removeAddressItem,
  saveAddressItem,
} = useMemberAddressesPageModel()

const isSelectionMode = computed(() => route.query.mode === 'select')
const editorMode = computed(() => {
  const currentEditor = route.query.editor

  return currentEditor === 'create' || currentEditor === 'edit'
    ? currentEditor
    : null
})
const editorVisible = computed(() => editorMode.value !== null)
const pageTitle = computed(() => (isSelectionMode.value ? '选择收货地址' : '地址管理'))
const editorTitle = computed(() => (editingAddressId.value ? '编辑地址' : '新增地址'))
const selectedAddressQueryId = computed(() =>
  typeof route.query.selectedAddressId === 'string'
    ? route.query.selectedAddressId
    : '',
)
const addressListModelValue = computed(() =>
  isSelectionMode.value ? selectedAddressId.value : undefined,
)

function formatAddressText(addressInfo: {
  province: string
  city: string
  county: string
  addressDetail: string
}) {
  return [addressInfo.province, addressInfo.city, addressInfo.county, addressInfo.addressDetail]
    .filter(Boolean)
    .join(' ')
}

function buildEditorInfo(address: Pick<
  MemberAddress,
  'areaCode' | 'addressDetail' | 'city' | 'county' | 'isDefault' | 'province' | 'recipientMobile' | 'recipientName'
>): AddressEditorInfo {
  return {
    areaCode: address.areaCode,
    addressDetail: address.addressDetail,
    city: address.city,
    county: address.county,
    isDefault: address.isDefault,
    name: address.recipientName,
    province: address.province,
    tel: address.recipientMobile,
  }
}

const addressList = computed<AddressListItemView[]>(() =>
  memberAddressesPageData.value.items.map((item) => ({
    address: formatAddressText(item),
    addressDetail: item.addressDetail,
    areaCode: item.areaCode,
    city: item.city,
    county: item.county,
    id: item.id,
    isDefault: item.isDefault,
    name: item.recipientName,
    province: item.province,
    tel: item.recipientMobile,
  })),
)

watch(
  [addressList, isSelectionMode, selectedAddressQueryId],
  ([items, selectionMode, querySelectedAddressId]) => {
    if (!selectionMode) {
      selectedAddressId.value = ''
      return
    }

    if (items.length === 0) {
      selectedAddressId.value = ''
      return
    }

    const routeSelectedAddress = querySelectedAddressId
      ? items.find((item) => item.id === querySelectedAddressId)?.id
      : ''

    if (routeSelectedAddress && routeSelectedAddress !== selectedAddressId.value) {
      selectedAddressId.value = routeSelectedAddress
      return
    }

    if (items.some((item) => item.id === selectedAddressId.value)) {
      return
    }

    selectedAddressId.value = items.find((item) => item.isDefault)?.id
      || items[0]?.id
      || ''
  },
  { immediate: true },
)

function findAddressListItem(addressId: string) {
  return addressList.value.find((item) => item.id === addressId) ?? null
}

function populateCreateEditor() {
  editingAddressId.value = null
  editorInfo.value = {
    areaCode: '',
    addressDetail: '',
    city: '',
    county: '',
    isDefault: memberAddressesPageData.value.items.length === 0,
    name: '',
    province: '',
    tel: '',
  }
  editorRenderKey.value += 1
}

function populateEditEditor(addressListItem: AddressListItemView) {
  editingAddressId.value = addressListItem.id
  editorInfo.value = buildEditorInfo({
    areaCode: addressListItem.areaCode,
    addressDetail: addressListItem.addressDetail,
    city: addressListItem.city,
    county: addressListItem.county,
    isDefault: addressListItem.isDefault,
    province: addressListItem.province,
    recipientMobile: addressListItem.tel,
    recipientName: addressListItem.name,
  })
  editorRenderKey.value += 1
}

function buildBaseRouteQuery() {
  const nextQuery = { ...route.query }

  delete nextQuery.editor
  delete nextQuery.addressId

  return nextQuery
}

async function replaceBaseRouteQuery() {
  const baseQuery = buildBaseRouteQuery()

  await router.replace({
    query: Object.keys(baseQuery).length > 0 ? baseQuery : undefined,
  })
}

function goBack() {
  if (editorVisible.value) {
    void closeEditor()
    return
  }

  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push(isSelectionMode.value ? '/checkout' : '/member')
}

async function closeEditor() {
  if (!editorVisible.value) {
    return
  }

  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    await router.back()
    return
  }

  await replaceBaseRouteQuery()
}

function openCreateAddressEditor() {
  void router.push({
    query: {
      ...route.query,
      addressId: undefined,
      editor: 'create',
    },
  })
}

function openEditAddressEditor(addressListItem: AddressListItemView) {
  void router.push({
    query: {
      ...route.query,
      addressId: addressListItem.id,
      editor: 'edit',
    },
  })
}

function handleListItemClick(addressListItem: AddressListItemView) {
  if (isSelectionMode.value) {
    return
  }

  openEditAddressEditor(addressListItem)
}

function handleSelectedAddressIdChange(value: string | number | undefined) {
  selectedAddressId.value = typeof value === 'string' ? value : String(value ?? '')
}

async function handleSelectAddress(addressListItem: AddressListItemView) {
  if (!isSelectionMode.value) {
    return
  }

  selectedAddressId.value = addressListItem.id

  try {
    await router.replace({
      name: typeof route.query.returnTo === 'string' && route.query.returnTo
        ? route.query.returnTo
        : 'checkout',
      query: {
        selectedAddressId: addressListItem.id,
      },
    })
  } catch (error) {
    showToast(error instanceof Error ? error.message : '地址选择失败')
  }
}

function handleEditorVisibilityChange(show: boolean) {
  if (show) {
    return
  }

  void closeEditor()
}

function normalizeSaveCommand(addressInfo: AddressEditorInfo): SaveMemberAddressCommand {
  return {
    areaCode: addressInfo.areaCode?.trim() ?? '',
    addressDetail: addressInfo.addressDetail?.trim() ?? '',
    city: addressInfo.city?.trim() ?? '',
    county: addressInfo.county?.trim() ?? '',
    id: editingAddressId.value ?? undefined,
    isDefault: addressInfo.isDefault === true,
    province: addressInfo.province?.trim() ?? '',
    recipientMobile: addressInfo.tel?.trim() ?? '',
    recipientName: addressInfo.name?.trim() ?? '',
  }
}

async function handleSaveAddress(addressInfo: AddressEditorInfo) {
  const command = normalizeSaveCommand(addressInfo)
  const isEditing = Boolean(editingAddressId.value)

  if (
    !command.recipientName
    || !command.recipientMobile
    || !command.areaCode
    || !command.addressDetail
  ) {
    showToast('请完整填写收货信息')
    return
  }

  try {
    await saveAddressItem(command)
    await closeEditor()
    showSuccessToast(isEditing ? '地址已更新' : '地址已新增')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '地址保存失败')
  }
}

async function handleDeleteAddress() {
  if (!editingAddressId.value) {
    return
  }

  try {
    await showConfirmDialog({
      title: '删除地址',
      message: '确认删除这个收货地址吗？',
      theme: 'round-button',
    })

    await removeAddressItem(editingAddressId.value)
    await closeEditor()
    showSuccessToast('地址已删除')
  } catch (error) {
    if (error === 'cancel') {
      return
    }

    showToast(error instanceof Error ? error.message : '地址删除失败')
  }
}

watch(
  [
    editorMode,
    () => route.query.addressId,
    () => isLoading.value,
  ],
  async ([editor, addressId, loading]) => {
    const nextEditorRouteKey = `${editor ?? ''}:${typeof addressId === 'string' ? addressId : ''}`

    if (editor === 'create') {
      if (editorRouteKey.value === nextEditorRouteKey) {
        return
      }

      populateCreateEditor()
      editorRouteKey.value = nextEditorRouteKey
      return
    }

    if (editor === 'edit' && typeof addressId === 'string') {
      if (loading) {
        return
      }

      if (editorRouteKey.value === nextEditorRouteKey) {
        return
      }

      const currentAddress = findAddressListItem(addressId)

      if (!currentAddress) {
        editorRouteKey.value = ''
        editingAddressId.value = null
        await replaceBaseRouteQuery()
        return
      }

      populateEditEditor(currentAddress)
      editorRouteKey.value = nextEditorRouteKey
      return
    }

    editorRouteKey.value = ''
    editingAddressId.value = null
  },
  { immediate: true },
)

onMounted(() => {
  void loadMemberAddressesPage()
})

onActivated(() => {
  void loadMemberAddressesPage()
})
</script>

<template>
  <section class="member-addresses-page">
    <PageTopBar :title="pageTitle" @back="goBack" />

    <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
    </p>

    <LoadingState v-else-if="isLoading" />

    <AddressList
      v-else
      :model-value="addressListModelValue"
      :list="addressList"
      add-button-text="新增地址"
      default-tag-text="默认"
      :switchable="isSelectionMode"
      @add="openCreateAddressEditor"
      @click-item="handleListItemClick"
      @edit="openEditAddressEditor"
      @select="handleSelectAddress"
      @update:model-value="handleSelectedAddressIdChange"
    />

    <van-popup
      :show="editorVisible"
      class="address-editor-popup"
      position="right"
      teleport="body"
      :style="{ width: '100vw', height: '100dvh' }"
      @update:show="handleEditorVisibilityChange"
    >
      <section class="address-editor-page">
        <PageTopBar :title="editorTitle" back-aria-label="关闭地址编辑" @back="closeEditor" />

        <div class="address-editor-scroll">
          <AddressEdit
            :key="editorRenderKey"
            :address-info="editorInfo"
            :area-list="addressAreaList"
            area-placeholder="请选择省 / 市 / 区县"
            delete-button-text="删除地址"
            :detail-rows="3"
            :show-delete="Boolean(editingAddressId)"
            show-set-default
            :show-search-result="false"
            @delete="handleDeleteAddress"
            @save="handleSaveAddress"
          />
        </div>
      </section>
    </van-popup>
  </section>
</template>

<style scoped>
.member-addresses-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.status-text {
  margin: 0;
  padding: 20px 16px;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
}

.address-editor-popup {
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  border-radius: 0;
  overflow: hidden;
  background: #fafaf8;
}

.address-editor-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: #fafaf8;
}

.address-editor-scroll {
  min-height: 0;
  overflow-y: auto;
}
</style>
