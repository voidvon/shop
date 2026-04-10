<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { useMemberAuthSession } from '@/entities/member-auth'
import { MemberCardBindPanel, useMemberCardBinding } from '@/features/member-card-binding'
import { scanMemberCardByWechat } from '@/features/member-card-binding/model/member-card-scanner'
import type { LookupMemberCardResult } from '@/processes/member-center'
import { normalizeMemberCardBindMobile, validateMemberCardBindMobile } from '@/processes/member-center/domain/member-card-bind-rules'
import { isWechatBrowser } from '@/shared/lib/wechat-browser'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCardBindPageModel } from '../model/useMemberCardBindPageModel'

const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const { bindMemberCard, lookupMemberCard } = useMemberCardBinding()
const { loadMemberCardBindPage, memberCardBindPageData } = useMemberCardBindPageModel()
const cardNumber = ref('')
const cardSecret = ref('')
const mobile = ref('')
const lookupResult = ref<LookupMemberCardResult | null>(null)
const isLookingUp = ref(false)
const isSubmitting = ref(false)
const defaultMobile = computed(() =>
  normalizeMemberCardBindMobile(memberAuthSession.getSnapshot().authResult?.userInfo.mobile ?? ''),
)
const normalizedMobile = computed(() => normalizeMemberCardBindMobile(mobile.value))
const mobileErrorMessage = computed(() => validateMemberCardBindMobile(normalizedMobile.value) ?? '')
const hasValidMobile = computed(() => !mobileErrorMessage.value)
const canSubmitBind = computed(() =>
  !isSubmitting.value && Boolean(lookupResult.value?.canBind) && hasValidMobile.value,
)

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

async function applyScannedCardInfo(nextCardNumber: string, nextCardSecret: string) {
  if (!nextCardNumber) {
    showFailToast('未读取到卡券编号，请手动输入后重试')
    return
  }

  cardNumber.value = nextCardNumber
  cardSecret.value = nextCardSecret

  if (!nextCardSecret) {
    showSuccessToast('已读取卡号，请补充卡密后继续')
    return
  }

  showSuccessToast('已读取卡券信息')
  await runLookupCard()
}

async function handleScanCard() {
  if (!memberCardBindPageData.value.canScanCode) {
    showFailToast('当前页面暂不支持微信扫码绑卡')
    return
  }

  if (!isWechatBrowser()) {
    showFailToast('请在微信内打开当前页面后扫码')
    return
  }

  try {
    const scanResult = await scanMemberCardByWechat()
    await applyScannedCardInfo(scanResult.cardNumber, scanResult.cardSecret)
  } catch (error) {
    const message = error instanceof Error ? error.message : '微信扫码失败'

    if (message === '已取消扫码') {
      return
    }

    showFailToast(message)
  }
}

async function submitBind() {
  mobile.value = normalizedMobile.value

  if (mobileErrorMessage.value) {
    showFailToast(mobileErrorMessage.value)
    return
  }

  if (!lookupResult.value?.canBind) {
    showFailToast('当前卡券不可绑定充值')
    return
  }

  isSubmitting.value = true

  try {
    await bindMemberCard({
      cardNumber: cardNumber.value,
      cardSecret: cardSecret.value,
      mobile: normalizedMobile.value,
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
  mobile.value = defaultMobile.value
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
      @preview="runLookupCard"
      @scan="handleScanCard"
    />

    <section v-if="lookupResult" class="bind-preview-card">
      <div class="preview-head">
        <div>
          <strong>{{ lookupResult.balanceTypeName || '储值卡信息' }}</strong>
          <p>确认卡信息和手机号后，再提交绑定。</p>
        </div>
        <span :class="['preview-status', { 'preview-status-disabled': !lookupResult.canBind }]">
          {{ lookupResult.statusText }}
        </span>
      </div>

      <dl class="preview-grid">
        <div>
          <dt>卡号</dt>
          <dd>{{ lookupResult.cardNumber }}</dd>
        </div>
        <div>
          <dt>面值</dt>
          <dd>¥{{ lookupResult.faceValue.toFixed(2) }}</dd>
        </div>
        <div>
          <dt>当前余额</dt>
          <dd>¥{{ lookupResult.currentAmount.toFixed(2) }}</dd>
        </div>
        <div>
          <dt>是否可绑</dt>
          <dd>{{ lookupResult.canBind ? '可绑定' : '不可绑定' }}</dd>
        </div>
      </dl>

      <label class="mobile-field">
        <span>手机号</span>
        <input
          v-model="mobile"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          placeholder="请输入绑定手机号"
        >
      </label>
      <p v-if="mobileErrorMessage" class="mobile-hint mobile-hint-error">{{ mobileErrorMessage }}</p>

      <button class="submit-button" :disabled="!canSubmitBind" type="button" @click="submitBind">
        {{ isSubmitting ? '绑定中...' : '确认绑定' }}
      </button>
    </section>
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

.bind-preview-card {
  display: grid;
  gap: 14px;
  margin: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(26, 25, 24, 0.06);
}

.preview-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.preview-head strong {
  color: #1a1918;
  font-size: 16px;
}

.preview-head p {
  margin: 6px 0 0;
  color: #8a7f78;
  font-size: 13px;
  line-height: 1.5;
}

.preview-status {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 106, 26, 0.12);
  color: #ff6a1a;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.preview-status-disabled {
  background: rgba(140, 138, 134, 0.12);
  color: #8c8a86;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.preview-grid div {
  display: grid;
  gap: 4px;
}

.preview-grid dt {
  color: #8a7f78;
  font-size: 12px;
}

.preview-grid dd {
  margin: 0;
  color: #1a1918;
  font-size: 14px;
  font-weight: 600;
}

.mobile-field {
  display: grid;
  gap: 8px;
}

.mobile-field span {
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
}

.mobile-field input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e5e4e1;
  border-radius: 14px;
  color: #1a1918;
  font-size: 14px;
  outline: none;
}

.mobile-field input::placeholder {
  color: #9c9b99;
}

.mobile-hint {
  margin: -6px 0 0;
  font-size: 12px;
}

.mobile-hint-error {
  color: #d14b4b;
}

.submit-button {
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: #ff6a1a;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.submit-button:disabled {
  opacity: 0.72;
}
</style>
