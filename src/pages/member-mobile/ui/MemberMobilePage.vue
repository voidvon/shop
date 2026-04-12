<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { showSuccessToast, showToast } from 'vant'

import { useMemberMobileEdit } from '@/features/member-mobile-edit'
import {
  normalizeMemberCardBindMobile,
  validateMemberCardBindMobile,
} from '@/processes/member-center/domain/member-card-bind-rules'

import { useMemberMobilePageModel } from '../model/useMemberMobilePageModel'
import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'

const { updateMemberMobile } = useMemberMobileEdit()
const { currentMobile, maskedMobile } = useMemberMobilePageModel()
const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()
const isSubmitting = ref(false)
const mobile = ref('')
const normalizedMobile = computed(() => normalizeMemberCardBindMobile(mobile.value))

watch(
  currentMobile,
  (value) => {
    mobile.value = value ?? ''
  },
  { immediate: true },
)

async function handleSave() {
  mobile.value = normalizedMobile.value

  const errorMessage = validateMemberCardBindMobile(normalizedMobile.value)

  if (errorMessage) {
    showToast(errorMessage)
    return
  }

  isSubmitting.value = true

  try {
    const result = await updateMemberMobile({ mobile: normalizedMobile.value })
    showSuccessToast(`手机号已更新为 ${result.mobile}`)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '手机号保存失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <MemberSettingsSubpageLayout title="手机号码" @back="goBackToMemberSettings">
    <van-form class="settings-form" @submit="handleSave">
      <van-cell-group inset>
        <van-cell title="当前绑定手机号" :value="maskedMobile" />
      </van-cell-group>

      <van-cell-group inset>
        <van-field
          v-model="mobile"
          type="tel"
          clearable
          label="手机号"
          name="mobile"
          placeholder="请输入手机号"
          :maxlength="11"
          :disabled="isSubmitting"
        />
      </van-cell-group>

      <van-button
        block
        round
        type="primary"
        native-type="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '保存中...' : '保存手机号' }}
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
