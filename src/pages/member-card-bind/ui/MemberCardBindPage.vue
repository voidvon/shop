<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { MemberCardBindPanel, useMemberCardBinding } from '@/features/member-card-binding'
import type { LookupMemberCardResult } from '@/processes/member-center'
import { memberCardNumberLengthRange } from '@/processes/member-center/domain/member-card-bind-rules'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCardBindPageModel } from '../model/useMemberCardBindPageModel'

const router = useRouter()
const { bindMemberCard, lookupMemberCard } = useMemberCardBinding()
const { loadMemberCardBindPage, memberCardBindPageData } = useMemberCardBindPageModel()
const cardNumber = ref('')
const cardSecret = ref('')
const lookupResult = ref<LookupMemberCardResult | null>(null)
const isLookingUp = ref(false)
const isSubmitting = ref(false)

function buildMockCardNumber() {
  return `DG${`${Date.now()}`.slice(-10)}`.slice(0, memberCardNumberLengthRange.max)
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member-cards' })
}

async function runLookupCard() {
  isLookingUp.value = true

  try {
    lookupResult.value = await lookupMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
    })
    showSuccessToast('卡信息已更新')
  } catch (error) {
    lookupResult.value = null
    showFailToast(error instanceof Error ? error.message : '卡信息查询失败')
  } finally {
    isLookingUp.value = false
  }
}

async function simulateScan() {
  cardNumber.value = memberCardBindPageData.value.cardNumber ?? buildMockCardNumber()

  if (!cardSecret.value) {
    return
  }

  showSuccessToast('已读取卡券信息')
  await runLookupCard()
}

async function submitBind() {
  isSubmitting.value = true

  try {
    await bindMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
    })
    showSuccessToast('充值成功')
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

watch([cardNumber, cardSecret], () => {
  lookupResult.value = null
})

onMounted(() => {
  void loadMemberCardBindPage()
})
</script>

<template>
  <section class="member-card-bind-page">
    <PageTopBar title="绑定卡券" @back="goBack" />

    <section class="bind-intro">
      <strong>扫码读取卡券编号并提交后端充值</strong>
      <p>当前页面用于单独演示绑卡充值链路。卡号支持 12-17 位字母数字组合，卡密支持 6-8 位。</p>
    </section>

    <MemberCardBindPanel
      v-model:card-number="cardNumber"
      v-model:card-secret="cardSecret"
      :is-looking-up="isLookingUp"
      :is-submitting="isSubmitting"
      :lookup-result="lookupResult"
      @lookup="runLookupCard"
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
