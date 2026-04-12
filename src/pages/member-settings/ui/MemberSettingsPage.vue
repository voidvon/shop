<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
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

.status-text {
  margin: 0;
  padding: 18px 0;
  color: #8c8a86;
  font-size: 13px;
  text-align: center;
}
</style>
