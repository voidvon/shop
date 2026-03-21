<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'

import { MemberCardBindPanel } from '@/features/member-card-binding'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCardsPageModel } from '../model/useMemberCardsPageModel'

const router = useRouter()
const bindDrawerVisible = ref(false)
const { loadMemberCardsPage, memberCardsPageData } = useMemberCardsPageModel()
const cardNumber = ref('')

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

function goToBindCard() {
  bindDrawerVisible.value = true
}

function closeBindDrawer() {
  bindDrawerVisible.value = false
}

function submitBindCard() {
  cardNumber.value = cardNumber.value.trim()
  showSuccessToast('卡券绑定成功')
  closeBindDrawer()
}

watch(
  () => memberCardsPageData.value.cardNumber,
  (value) => {
    if (value && !cardNumber.value) {
      cardNumber.value = value
    }
  },
  { immediate: true },
)

onMounted(() => {
  void loadMemberCardsPage()
})
</script>

<template>
  <section class="member-cards-page">
    <PageTopBar title="我的卡券" @back="goBack" />

    <section class="balance-bar">
      <div class="balance-left">
        <span class="balance-label">账户余额</span>
        <span class="balance-pill">¥ {{ memberCardsPageData.balanceAmount.toFixed(2) }}</span>
      </div>

      <button class="pay-link" type="button">使用付款码支付</button>
    </section>

    <div class="content-area">
      <EmptyState
        boxed
        class="empty-state"
        description="绑定后可在这里查看卡券信息，并快速进入余额付款。"
        description-width="248px"
        icon="coupon-o"
        :icon-size="40"
        title="暂无卡券"
      />

      <button class="primary-button" type="button" @click="goToBindCard">绑定新卡</button>
    </div>

    <van-popup
      v-model:show="bindDrawerVisible"
      class="bind-drawer"
      position="right"
      teleport="body"
      :style="{ width: '100vw', height: '100dvh' }"
    >
      <section class="bind-drawer-body">
        <PageTopBar title="绑定卡券" back-aria-label="关闭绑定卡券抽屉" @back="closeBindDrawer" />

        <MemberCardBindPanel v-model:card-number="cardNumber" @submit="submitBindCard" />
      </section>
    </van-popup>
  </section>
</template>

<style scoped>
.member-cards-page {
  display: grid;
  grid-template-rows: 56px 40px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.balance-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  background: #ff6a1a;
}

.balance-left {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.balance-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}

.balance-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.pay-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.content-area {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  align-items: center;
  padding: 72px 20px 20px;
}

.empty-state {
  align-content: center;
}

.primary-button {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 14px;
  background: #ff6a1a;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 1px 6px rgba(26, 25, 24, 0.08);
}

.bind-drawer {
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  border-radius: 0;
  overflow: hidden;
  background: #fafaf8;
}

.bind-drawer-body {
  display: grid;
  grid-template-rows: 56px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: #fafaf8;
}
</style>
