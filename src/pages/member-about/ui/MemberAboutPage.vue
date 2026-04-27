<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Copy } from 'lucide-vue-next'
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
const copyableKeys = new Set(['customer-service-phone', 'customer-service-wechat', 'business-phone'])

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

async function handleCopyValue(value: string) {
  if (!value) {
    return
  }

  try {
    await navigator.clipboard.writeText(value)
    showSuccessToast('已复制')
  } catch {
    showFailToast('复制失败')
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

    <van-cell-group v-else inset class="info-group">
      <van-cell
        v-for="item in infoRows"
        :key="item.key"
        :title="item.label"
        :value="item.key === 'company-name' || copyableKeys.has(item.key) ? undefined : (item.value || '待补充')"
      >
        <template v-if="item.key === 'company-name'" #value>
          <button class="company-trigger" type="button" @click="handleBrandTap">
            {{ item.value || '待补充' }}
          </button>
        </template>

        <template v-else-if="copyableKeys.has(item.key)" #value>
          <strong class="copyable-value">
            <span>{{ item.value || '待补充' }}</span>
            <button
              v-if="item.value"
              class="icon-copy-button"
              type="button"
              @click="handleCopyValue(item.value)"
            >
              <Copy :size="16" :stroke-width="2.4" />
            </button>
          </strong>
        </template>
      </van-cell>
    </van-cell-group>
  </MemberSettingsSubpageLayout>
</template>

<style scoped>
.company-trigger {
  padding: 0;
  border: 0;
  background: transparent;
  color: #8c8a86;
  font-size: 13px;
  line-height: 1.4;
}

.copyable-value {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  color: #8c8a86;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
}

.icon-copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #9c9b99;
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
