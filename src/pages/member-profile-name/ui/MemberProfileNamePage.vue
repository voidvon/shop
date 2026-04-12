<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { showSuccessToast, showToast } from 'vant'

import { useMemberProfileNameEdit } from '@/features/member-profile-name-edit'

import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'

import { useMemberProfileNamePageModel } from '../model/useMemberProfileNamePageModel'

const {
  isLoading,
  loadMemberProfileNamePage,
  memberProfileNamePageData,
} = useMemberProfileNamePageModel()
const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()
const { updateMemberProfileName } = useMemberProfileNameEdit()
const isSubmitting = ref(false)
const nickname = ref('')

async function handleSave() {
  const normalizedNickname = nickname.value.trim()

  if (!normalizedNickname) {
    showToast('请输入用户昵称')
    return
  }

  if (normalizedNickname.length > memberProfileNamePageData.value.maxLength) {
    showToast(`昵称最多 ${memberProfileNamePageData.value.maxLength} 个字符`)
    return
  }

  try {
    isSubmitting.value = true
    await updateMemberProfileName(normalizedNickname)
    showSuccessToast('昵称已更新')
    goBackToMemberSettings()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '昵称保存失败')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => memberProfileNamePageData.value.currentNickname,
  (value) => {
    nickname.value = value
  },
  { immediate: true },
)

onMounted(() => {
  void loadMemberProfileNamePage()
})
</script>

<template>
  <MemberSettingsSubpageLayout title="用户昵称" @back="goBackToMemberSettings">
    <van-form class="settings-form" @submit="handleSave">
      <van-cell-group inset>
        <van-field
          v-model="nickname"
          autocomplete="nickname"
          clearable
          label="昵称"
          name="nickname"
          :disabled="isLoading || isSubmitting"
          :maxlength="memberProfileNamePageData.maxLength"
          placeholder="请输入用户昵称"
        />
      </van-cell-group>

      <van-button
        block
        round
        type="primary"
        native-type="submit"
        :disabled="isSubmitting || isLoading"
      >
        {{ isSubmitting ? '保存中...' : '保存昵称' }}
      </van-button>
    </van-form>
  </MemberSettingsSubpageLayout>
</template>

<style scoped>
:deep(.settings-form) {
  display: grid;
  gap: 12px;
  min-width: 0;
}

:deep(.van-button) {
  width: calc(100% - 32px);
  margin: 0 16px;
  box-sizing: border-box;
}
</style>
