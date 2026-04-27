<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'

import { useMemberSettingsSubpageNavigation } from '@/pages/member-settings/model/useMemberSettingsSubpageNavigation'
import LoadingState from '@/shared/ui/LoadingState.vue'
import MemberSettingsSubpageLayout from '@/pages/member-settings/ui/MemberSettingsSubpageLayout.vue'
import { enableVConsole } from '@/shared/lib/vconsole'

import { useMemberAboutPageModel } from '../model/useMemberAboutPageModel'

const { errorMessage, isLoading, loadMemberAboutPage, memberAboutPageData } = useMemberAboutPageModel()
const { goBackToMemberSettings } = useMemberSettingsSubpageNavigation()
const brandTapCount = ref(0)
const isEnablingVConsole = ref(false)

const infoRows = computed(() => [
  { key: 'company-name', label: '公司名称', value: memberAboutPageData.value.companyName },
  { key: 'company-address', label: '公司地址', value: memberAboutPageData.value.companyAddress },
  { key: 'customer-service-phone', label: '客服电话', value: memberAboutPageData.value.customerServicePhone },
  { key: 'customer-service-wechat', label: '客服微信', value: memberAboutPageData.value.customerServiceWechat },
  { key: 'business-phone', label: '商务电话', value: memberAboutPageData.value.businessPhone },
])

async function handleBrandTap() {
  if (isEnablingVConsole.value) {
    return
  }

  brandTapCount.value += 1

  if (brandTapCount.value < 5) {
    return
  }

  brandTapCount.value = 0
  isEnablingVConsole.value = true

  try {
    await enableVConsole()
    showSuccessToast('vConsole 已开启')
  } catch {
    showFailToast('vConsole 加载失败')
  } finally {
    isEnablingVConsole.value = false
  }
}

onMounted(() => {
  void loadMemberAboutPage()
})
</script>

<template>
  <MemberSettingsSubpageLayout title="关于我们" @back="goBackToMemberSettings">
    <p v-if="errorMessage" class="status-text">{{ errorMessage }}</p>
    <LoadingState v-else-if="isLoading" />

    <template v-else>
      <section class="brand-panel">
        <button class="brand-trigger" type="button" @click="handleBrandTap">
          优胜平台
        </button>
        <p>城市生活服务平台</p>
      </section>

      <van-cell-group inset class="info-group">
        <van-cell
          v-for="item in infoRows"
          :key="item.key"
          :title="item.label"
          :value="item.value || '待补充'"
        />
      </van-cell-group>
    </template>
  </MemberSettingsSubpageLayout>
</template>

<style scoped>
.brand-panel {
  display: grid;
  gap: 8px;
  justify-items: center;
  margin-top: 12px;
  padding: 28px 20px 24px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.96)),
    linear-gradient(135deg, #efe7d8 0%, #f7f3eb 100%);
  box-shadow: 0 10px 24px rgba(42, 37, 32, 0.06);
}

.brand-trigger {
  padding: 0;
  border: 0;
  background: transparent;
  color: #2d251d;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.brand-panel p {
  margin: 0;
  color: #8c8a86;
  font-size: 13px;
}

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
