<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberSettingsPageModel } from '../model/useMemberSettingsPageModel'

const router = useRouter()
const { errorMessage, isLoading, loadMemberSettingsPage, memberSettingsPageData } = useMemberSettingsPageModel()

const settingIcons = {
  about: 'guide-o',
  'login-password': 'shield-o',
  mobile: 'phone-o',
  'payment-password': 'passed',
  'profile-name': 'contact-o',
} as const

const pageDescription = computed(() => {
  if (memberSettingsPageData.value.settings.length === 0) {
    return '当前没有可配置项。'
  }

  const visibleSettingKeys = new Set(memberSettingsPageData.value.settings.map((item) => item.key))
  const { canResetPassword, hasBoundMobile, hasPaymentPassword } = memberSettingsPageData.value.security
  const summaryParts: string[] = []

  if (visibleSettingKeys.has('mobile')) {
    summaryParts.push(hasBoundMobile ? '已绑定手机号' : '未绑定手机号')
  }

  if (visibleSettingKeys.has('payment-password')) {
    summaryParts.push(hasPaymentPassword ? '已设置支付密码' : '未设置支付密码')
  }

  if (visibleSettingKeys.has('login-password')) {
    summaryParts.push(canResetPassword ? '支持修改登录密码' : '暂不支持修改登录密码')
  }

  return summaryParts.join('，') || '当前仅提供已接入的账户设置能力。'
})

function resolveSettingIcon(settingKey: string) {
  return settingIcons[settingKey as keyof typeof settingIcons] ?? 'setting-o'
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member' })
}

onMounted(() => {
  void loadMemberSettingsPage()
})

onActivated(() => {
  void loadMemberSettingsPage()
})
</script>

<template>
  <section class="member-settings-page">
    <PageTopBar title="用户设置" @back="goBack" />

    <div class="content-scroll">
      <van-cell-group inset class="page-summary">
        <van-cell title="账户与安全" :label="pageDescription" />
      </van-cell-group>

      <p v-if="errorMessage" class="status-text">{{ errorMessage }}</p>
      <LoadingState v-else-if="isLoading" />

      <van-cell-group v-else inset>
        <van-cell
          v-for="setting in memberSettingsPageData.settings"
          :key="setting.key"
          center
          is-link
          :icon="resolveSettingIcon(setting.key)"
          :title="setting.label"
          :to="setting.route"
          :value="setting.value ?? ''"
        />
      </van-cell-group>
    </div>
  </section>
</template>

<style scoped>
.member-settings-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: var(--van-background-2);
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 0 24px;
  overflow-y: auto;
}

.content-scroll :deep(.van-cell-group--inset) {
  border: 1px solid #e7e0d7;
  box-shadow: 0 1px 2px rgba(60, 59, 57, 0.04);
}

.page-summary {
  margin-bottom: 12px;
}

.status-text {
  margin: 0;
  padding: 18px 0;
  color: #8c8a86;
  font-size: 13px;
  text-align: center;
}
</style>
