<script setup lang="ts">
import { showSuccessToast, showToast } from 'vant'

import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'

import { useMemberPayPasswordPageModel } from '../model/useMemberPayPasswordPageModel'

const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()
const { form, isSubmitting, submitMemberPayPasswordForm } = useMemberPayPasswordPageModel()

async function handleSubmit() {
  try {
    await submitMemberPayPasswordForm()
    showSuccessToast('支付密码已更新')
    goBackToMemberSettings()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '支付密码修改失败')
  }
}
</script>

<template>
  <MemberSettingsSubpageLayout title="支付密码" @back="goBackToMemberSettings">
    <van-form class="settings-form" @submit="handleSubmit">
      <van-cell-group inset>
        <van-cell
          title="管理支付密码"
          label="用于余额扣款等资金操作验证。当前版本先提供 mock 提交，后续可接短信或人脸校验。"
        />
      </van-cell-group>

      <van-cell-group inset>
        <van-field
          v-model="form.currentPassword"
          autocomplete="current-password"
          clearable
          inputmode="numeric"
          label="当前支付密码"
          maxlength="6"
          name="currentPassword"
          placeholder="请输入当前支付密码"
          type="password"
        />
        <van-field
          v-model="form.newPassword"
          autocomplete="new-password"
          clearable
          inputmode="numeric"
          label="新支付密码"
          maxlength="6"
          name="newPassword"
          placeholder="请输入 6 位数字密码"
          type="password"
        />
        <van-field
          v-model="form.confirmPassword"
          autocomplete="new-password"
          clearable
          inputmode="numeric"
          label="确认新支付密码"
          maxlength="6"
          name="confirmPassword"
          placeholder="请再次输入 6 位数字密码"
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
