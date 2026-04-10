<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'

import { useMemberCardBinding } from '@/features/member-card-binding'
import {
  prepareMemberCardScanByWechat,
  scanMemberCardByWechat,
} from '@/features/member-card-binding/model/member-card-scanner'
import type { LookupMemberCardResult } from '@/processes/member-center'
import { isWechatBrowser } from '@/shared/lib/wechat-browser'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const router = useRouter()
const { lookupMemberCard } = useMemberCardBinding()

const cardNumber = ref('')
const cardSecret = ref('')
const isLookingUp = ref(false)
const lookupResult = ref<LookupMemberCardResult | null>(null)
const resultDrawerVisible = ref(false)

const balanceTypeLabel = computed(() => lookupResult.value?.balanceTypeName?.trim() || '储值卡')

function formatAmount(value: number) {
  return value.toFixed(2)
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'home' })
}

function closeResultDrawer() {
  resultDrawerVisible.value = false
}

async function runLookupCard() {
  isLookingUp.value = true

  try {
    lookupResult.value = await lookupMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
    })
    resultDrawerVisible.value = true
  } catch (error) {
    lookupResult.value = null
    resultDrawerVisible.value = false
    showFailToast(error instanceof Error ? error.message : '卡片余额查询失败')
  } finally {
    isLookingUp.value = false
  }
}

async function applyScannedCardInfo(nextCardNumber: string, nextCardSecret: string) {
  if (!nextCardNumber) {
    showFailToast('未读取到卡券编号，请手动输入后重试')
    return
  }

  cardNumber.value = nextCardNumber
  cardSecret.value = nextCardSecret

  if (!nextCardSecret) {
    showFailToast('未读取到卡密，请使用包含完整卡信息的二维码')
    return
  }

  showSuccessToast('已读取卡券信息')
  await runLookupCard()
}

async function handleScanCard() {
  if (!isWechatBrowser()) {
    showFailToast('请在微信内打开当前页面后扫码')
    return
  }

  const loadingToast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '加载中...',
  })

  try {
    await prepareMemberCardScanByWechat()
    loadingToast.close()
    const scanResult = await scanMemberCardByWechat()
    await applyScannedCardInfo(scanResult.cardNumber, scanResult.cardSecret)
  } catch (error) {
    loadingToast.close()
    const message = error instanceof Error ? error.message : '微信扫码失败'

    if (message === '已取消扫码') {
      return
    }

    showFailToast(message)
  }
}

watch([cardNumber, cardSecret], () => {
  lookupResult.value = null
  resultDrawerVisible.value = false
})
</script>

<template>
  <section class="member-balance-query-page">
    <PageTopBar title="余额查询" @back="goBack" />

    <div class="content-scroll">
      <section class="intro-card">
        <strong>扫码查询卡片余额</strong>
      </section>

      <section class="lookup-card">
        <div class="scan-panel">
          <button class="scan-button" :disabled="isLookingUp" type="button" @click="handleScanCard">
            <van-icon name="scan" size="108" />
          </button>
          <strong>{{ isLookingUp ? '查询中...' : '点击扫码' }}</strong>
        </div>
      </section>
    </div>

    <van-popup
      :show="resultDrawerVisible"
      class="result-drawer"
      position="bottom"
      round
      teleport="body"
      @update:show="closeResultDrawer"
    >
      <section v-if="lookupResult" class="result-sheet">
        <header class="result-header">
          <div>
            <strong>卡片余额</strong>
            <p>{{ balanceTypeLabel }}</p>
          </div>
          <button class="result-close" type="button" @click="closeResultDrawer">关闭</button>
        </header>

        <section class="hero-card">
          <span>当前可用余额</span>
          <strong>¥{{ formatAmount(lookupResult.currentAmount) }}</strong>
        </section>

        <dl class="detail-grid">
          <div>
            <dt>卡号</dt>
            <dd>{{ lookupResult.cardNumber }}</dd>
          </div>
          <div>
            <dt>余额类型</dt>
            <dd>{{ balanceTypeLabel }}</dd>
          </div>
          <div>
            <dt>卡片面值</dt>
            <dd>¥{{ formatAmount(lookupResult.faceValue) }}</dd>
          </div>
          <div>
            <dt>卡片状态</dt>
            <dd>{{ lookupResult.statusText }}</dd>
          </div>
        </dl>
      </section>
    </van-popup>
  </section>
</template>

<style scoped>
.member-balance-query-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(255, 140, 66, 0.14), transparent 38%),
    linear-gradient(180deg, #fff8f1 0%, #f6f1ea 100%);
  overflow: hidden;
}

.content-scroll {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
  padding: 14px 16px 24px;
  overflow: hidden;
}

.intro-card,
.lookup-card,
.hero-card,
.detail-grid {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(26, 25, 24, 0.06);
}

.intro-card {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  padding: 18px;
}

.intro-card strong {
  color: #1f1d1a;
  font-size: 17px;
}

.lookup-card {
  min-height: 0;
  display: grid;
  overflow: hidden;
}

.scan-panel {
  display: grid;
  gap: 14px;
  justify-items: center;
  align-content: center;
  min-height: 0;
  height: 100%;
  padding: 24px 20px;
  text-align: center;
}

.scan-button {
  display: grid;
  place-items: center;
  width: 168px;
  height: 168px;
  border: 0;
  border-radius: 30px;
  background: linear-gradient(180deg, #fff3ea 0%, #ffe1cb 100%);
  color: #ef6b22;
}

.scan-button:disabled {
  opacity: 0.72;
}

.scan-panel strong {
  color: #ca6a32;
  font-size: 18px;
  font-weight: 600;
}

.scan-panel p {
  margin: 0;
  max-width: 260px;
  color: #907b70;
  font-size: 13px;
  line-height: 1.5;
}

.result-sheet {
  display: grid;
  gap: 14px;
  padding: 18px 16px calc(20px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, #fff8f1 0%, #f8f4ee 100%);
}

.result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.result-header strong {
  color: #1f1d1a;
  font-size: 18px;
}

.result-header p {
  margin: 6px 0 0;
  color: #8b8078;
  font-size: 13px;
}

.result-close {
  padding: 0;
  border: 0;
  background: transparent;
  color: #8b8078;
  font-size: 14px;
}

.hero-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  background: linear-gradient(135deg, #ff7a1a 0%, #ea580c 100%);
}

.hero-card span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
}

.hero-card strong {
  color: #fff;
  font-size: 34px;
  line-height: 1;
}

.detail-grid {
  display: grid;
  gap: 0;
  padding: 6px 0;
}

.detail-grid div {
  display: grid;
  gap: 6px;
  padding: 14px 18px;
}

.detail-grid div + div {
  border-top: 1px solid #f1ece6;
}

.detail-grid dt {
  color: #8b8078;
  font-size: 12px;
}

.detail-grid dd {
  margin: 0;
  color: #1f1d1a;
  font-size: 15px;
  font-weight: 600;
  word-break: break-all;
}
</style>
