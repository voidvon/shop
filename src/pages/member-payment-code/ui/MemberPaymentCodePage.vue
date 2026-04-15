<script setup lang="ts">
import QRCode from 'qrcode'
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import { useBackendAAuthRecoveryState } from '@/shared/lib/backend-a-auth-recovery'

import { useMemberPaymentCodePageModel } from '../model/useMemberPaymentCodePageModel'

const router = useRouter()
const {
  errorMessage,
  isLoading,
  loadMemberPaymentCodePage,
  memberPaymentCodePageData,
} = useMemberPaymentCodePageModel()
const isAuthRecovering = useBackendAAuthRecoveryState()
const paymentCode = computed(() => memberPaymentCodePageData.value.paymentCode)
const generatedCodeUrl = ref<string | null>(null)
let generateCodeTaskId = 0

const displayCodeUrl = computed(() => paymentCode.value?.codeUrl || generatedCodeUrl.value)

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

watch(
  paymentCode,
  async (nextPaymentCode) => {
    const taskId = ++generateCodeTaskId
    generatedCodeUrl.value = null

    if (!nextPaymentCode || nextPaymentCode.codeUrl || !nextPaymentCode.codeValue) {
      return
    }

    try {
      const nextCodeUrl = await QRCode.toDataURL(nextPaymentCode.codeValue, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 280,
      })

      if (taskId !== generateCodeTaskId) {
        return
      }

      generatedCodeUrl.value = nextCodeUrl
    } catch {
      if (taskId !== generateCodeTaskId) {
        return
      }

      generatedCodeUrl.value = null
    }
  },
  { immediate: true },
)

onMounted(() => {
  void loadMemberPaymentCodePage()
})

onActivated(() => {
  void loadMemberPaymentCodePage()
})
</script>

<template>
  <section class="member-payment-code-page">
    <PageTopBar title="付款码" @back="goBack" />

    <div class="content-scroll">
      <section class="hero-card">
        <span class="eyebrow">线下消费</span>
        <strong>向商户出示付款码</strong>
      </section>

      <p v-if="errorMessage && !isAuthRecovering" class="status-text">{{ errorMessage }}</p>
      <LoadingState v-else-if="isLoading || isAuthRecovering" />

      <section v-else-if="paymentCode" class="code-card">
        <div v-if="displayCodeUrl" class="code-frame">
          <img class="code-image" :src="displayCodeUrl" alt="付款码">
        </div>

        <div class="code-copy">
          <span>付款码编号</span>
          <strong>{{ paymentCode.codeValue || '后端未返回可展示编号' }}</strong>
        </div>
      </section>

      <EmptyState
        v-else
        boxed
        class="empty-state"
        description="后端当前没有返回可展示的付款码图片或编号。"
        description-width="240px"
        icon="qr-invalid"
        title="暂无付款码"
      />
    </div>
  </section>
</template>

<style scoped>
.member-payment-code-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(255, 132, 61, 0.22), transparent 34%),
    linear-gradient(180deg, #fff8f2 0%, #f3efe8 100%);
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 16px 24px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.hero-card,
.code-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(27, 25, 22, 0.08);
}

.hero-card {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  padding: 18px;
}

.eyebrow {
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-card strong {
  color: #1f1d1a;
  font-size: 22px;
  line-height: 1.2;
}

.hero-card p,
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

.code-card {
  display: grid;
  gap: 16px;
  padding: 20px 18px;
}

.code-frame {
  display: grid;
  place-items: center;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff6ef 0%, #fff 100%);
}

.code-image {
  display: block;
  width: min(100%, 280px);
  max-height: 280px;
  object-fit: contain;
}

.code-copy {
  display: grid;
  gap: 8px;
}

.code-copy span {
  color: #8c8a86;
  font-size: 12px;
}

.code-copy strong {
  word-break: break-all;
  color: #1f1d1a;
  font-size: 18px;
  line-height: 1.5;
}

.empty-state {
  margin-top: 12px;
}
</style>
