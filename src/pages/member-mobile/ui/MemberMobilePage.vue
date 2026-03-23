<script setup lang="ts">
import { ref } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'

import { useMemberMobileBinding } from '@/features/member-mobile-binding'

import { useMemberMobilePageModel } from '../model/useMemberMobilePageModel'
import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'

const { bindMemberMobileByWechat } = useMemberMobileBinding()
const { canBindMobileByWechat, maskedMobile, mobileStatusText } = useMemberMobilePageModel()
const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()
const isBinding = ref(false)

async function handleWechatBind() {
  isBinding.value = true

  try {
    const result = await bindMemberMobileByWechat()
    showSuccessToast(`手机号已更新为 ${result.mobile}`)
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '手机号绑定失败')
  } finally {
    isBinding.value = false
  }
}
</script>

<template>
  <MemberSettingsSubpageLayout title="手机号码" @back="goBackToMemberSettings">
    <section class="settings-stack">
      <van-cell-group inset>
        <van-cell title="当前绑定手机号" :value="maskedMobile" />
        <van-cell
          title="状态说明"
          :label="`${mobileStatusText} 手机号将用于登录识别、订单通知与账户安全校验。`"
        />
      </van-cell-group>

      <section v-if="canBindMobileByWechat" class="action-stack">
        <van-cell-group inset>
          <van-cell
            title="微信授权手机号"
            label="这里暂时不走短信验证码步骤，后续接入微信 SDK 后，直接通过微信授权获取并更新手机号。"
          />
        </van-cell-group>
        <van-button block round type="success" :disabled="isBinding" @click="handleWechatBind">
          {{ isBinding ? '获取中...' : '微信获取手机号' }}
        </van-button>
      </section>

      <van-cell-group inset>
        <van-cell
          title="接入说明"
          label="手机号会用于登录识别、订单通知与账户安全校验，后续统一通过微信授权方式完成获取和更新。"
        />
      </van-cell-group>
    </section>
  </MemberSettingsSubpageLayout>
</template>

<style scoped>
.settings-stack,
.action-stack {
  display: grid;
  gap: 12px;
}

:deep(.van-button) {
  margin: 0 16px;
}
</style>
