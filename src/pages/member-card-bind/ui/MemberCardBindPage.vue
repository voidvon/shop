<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { MemberCardBindPanel, useMemberCardBinding } from '@/features/member-card-binding'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCardBindPageModel } from '../model/useMemberCardBindPageModel'

const router = useRouter()
const { bindMemberCard } = useMemberCardBinding()
const { loadMemberCardBindPage, memberCardBindPageData } = useMemberCardBindPageModel()
const cardNumber = ref('')
const cardSecret = ref('')
const isSubmitting = ref(false)

function buildMockCardNumber() {
  return `${Date.now()}`.slice(-16).padStart(16, '8')
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member-cards' })
}

function simulateScan() {
  cardNumber.value = memberCardBindPageData.value.cardNumber ?? buildMockCardNumber()
}

async function submitBind() {
  isSubmitting.value = true

  try {
    const result = await bindMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
    })
    showSuccessToast(`充值成功，到账 ¥${result.redemption.amount.toFixed(2)}`)
    void router.push({ name: 'member-cards' })
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '卡券充值失败')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => memberCardBindPageData.value.cardNumber,
  (value) => {
    if (value && !cardNumber.value) {
      cardNumber.value = value
    }
  },
  { immediate: true },
)

onMounted(() => {
  void loadMemberCardBindPage()
})
</script>

<template>
  <section class="member-card-bind-page">
    <PageTopBar title="绑定卡券" @back="goBack" />

    <section class="bind-intro">
      <strong>扫码读取卡券编号并提交后端充值</strong>
      <p>当前页面用于单独演示绑卡充值链路，充值成功后会同步到账户余额和卡券兑换记录。</p>
    </section>

    <MemberCardBindPanel
      v-model:card-number="cardNumber"
      v-model:card-secret="cardSecret"
      :is-submitting="isSubmitting"
      @simulate-scan="simulateScan"
      @submit="submitBind"
    />
  </section>
</template>

<style scoped>
.member-card-bind-page {
  display: grid;
  grid-template-rows: 56px auto minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.bind-intro {
  display: grid;
  gap: 8px;
  margin: 16px 16px 0;
  padding: 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(26, 25, 24, 0.06);
}

.bind-intro strong {
  color: #1a1918;
  font-size: 16px;
}

.bind-intro p {
  margin: 0;
  color: #8a7f78;
  font-size: 13px;
  line-height: 1.5;
}
</style>
