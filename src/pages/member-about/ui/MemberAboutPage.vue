<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import LoadingState from '@/shared/ui/LoadingState.vue'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'

import { useMemberAboutPageModel } from '../model/useMemberAboutPageModel'

const { errorMessage, isLoading, loadMemberAboutPage, memberAboutPageData } = useMemberAboutPageModel()
const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()

const infoRows = computed(() => [
  { key: 'company-name', label: '公司名称', value: memberAboutPageData.value.companyName },
  { key: 'company-address', label: '公司地址', value: memberAboutPageData.value.companyAddress },
  { key: 'customer-service-phone', label: '客服电话', value: memberAboutPageData.value.customerServicePhone },
  { key: 'customer-service-wechat', label: '客服微信', value: memberAboutPageData.value.customerServiceWechat },
  { key: 'business-phone', label: '商务电话', value: memberAboutPageData.value.businessPhone },
])

onMounted(() => {
  void loadMemberAboutPage()
})
</script>

<template>
  <MemberSettingsSubpageLayout title="关于我们" @back="goBackToMemberSettings">
    <p v-if="errorMessage" class="status-text">{{ errorMessage }}</p>
    <LoadingState v-else-if="isLoading" />

    <van-cell-group v-else inset class="info-group">
      <van-cell
        v-for="item in infoRows"
        :key="item.key"
        :title="item.label"
        :value="item.value || '待补充'"
      />
    </van-cell-group>
  </MemberSettingsSubpageLayout>
</template>

<style scoped>
.info-group {
  margin-top: 12px;
}

.status-text {
  margin: 0;
  color: #8c8a86;
  font-size: 13px;
  line-height: 1.6;
}

.status-text {
  padding: 18px 0;
  text-align: center;
}
</style>
