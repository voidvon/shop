<script setup lang="ts">
import { onMounted } from 'vue'

import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import LoadingState from '@/shared/ui/LoadingState.vue'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'

import { useMemberAboutPageModel } from '../model/useMemberAboutPageModel'

const { errorMessage, isLoading, loadMemberAboutPage, memberAboutPageData } = useMemberAboutPageModel()
const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()

onMounted(() => {
  void loadMemberAboutPage()
})
</script>

<template>
  <MemberSettingsSubpageLayout title="关于我们" @back="goBackToMemberSettings">
    <section class="settings-stack">
      <van-cell-group inset>
        <van-cell
          :title="memberAboutPageData.companyName || '平台信息'"
          :label="memberAboutPageData.platformMission || '加载中...'"
        />
      </van-cell-group>

      <p v-if="errorMessage" class="status-text">{{ errorMessage }}</p>
      <LoadingState v-else-if="isLoading" />

      <van-cell-group v-else inset>
        <van-cell title="主办单位" :value="memberAboutPageData.organizerName" />
        <van-cell title="运营单位" :value="memberAboutPageData.operatorName" />
        <van-cell title="平台背景" :label="memberAboutPageData.platformBackground" />
        <van-cell title="平台使命" :label="memberAboutPageData.platformMission" />
      </van-cell-group>
    </section>

    <p class="copyright">
      Copyright © {{ memberAboutPageData.copyrightYear }}
      {{ memberAboutPageData.companyName }}
    </p>
  </MemberSettingsSubpageLayout>
</template>

<style scoped>
.settings-stack {
  display: grid;
  gap: 12px;
}

.status-text,
.copyright {
  margin: 0;
  color: #8c8a86;
  font-size: 13px;
  line-height: 1.6;
}

.status-text {
  padding: 18px 0;
  text-align: center;
}

.copyright {
  padding: 14px 4px 0;
  text-align: center;
}
</style>
