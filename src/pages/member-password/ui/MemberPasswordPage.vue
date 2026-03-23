<script setup lang="ts">
import { showSuccessToast, showToast } from 'vant'

import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'

import { useMemberPasswordPageModel } from '../model/useMemberPasswordPageModel'

const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()
const { form, isSubmitting, submitMemberPasswordForm } = useMemberPasswordPageModel()

async function handleSubmit() {
  try {
    await submitMemberPasswordForm()
    showSuccessToast('登录密码已更新')
    goBackToMemberSettings()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '登录密码修改失败')
  }
}
</script>

<template>
  <MemberSettingsSubpageLayout title="登录密码" @back="goBackToMemberSettings">
    <van-form class="settings-form" @submit="handleSubmit">
      <van-cell-group inset>
        <van-cell
          title="修改登录密码"
          label="当前先走 mock 提交流程，后续可接短信校验或原密码验证接口。"
        />
      </van-cell-group>

      <van-cell-group inset>
        <van-field
          v-model="form.currentPassword"
          autocomplete="current-password"
          clearable
          label="当前密码"
          name="currentPassword"
          placeholder="请输入当前登录密码"
          type="password"
        />
        <van-field
          v-model="form.newPassword"
          autocomplete="new-password"
          clearable
          label="新密码"
          name="newPassword"
          placeholder="请输入新登录密码"
          type="password"
        />
        <van-field
          v-model="form.confirmPassword"
          autocomplete="new-password"
          clearable
          label="确认新密码"
          name="confirmPassword"
          placeholder="请再次输入新密码"
          type="password"
        />
      </van-cell-group>

      <van-button block round type="primary" native-type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '确认修改' }}
      </van-button>
    </van-form>
  </MemberSettingsSubpageLayout>
</template>

<style scoped>
:deep(.settings-form) {
  display: grid;
  gap: 12px;
}

:deep(.van-button) {
  margin: 0 16px;
}
</style>
