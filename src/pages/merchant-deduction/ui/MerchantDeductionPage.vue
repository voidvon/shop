<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  hydrateBackendAMemberAuthSession,
  useMemberAuthSession,
} from '@/entities/member-auth'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const authSnapshot = ref(memberAuthSession.getSnapshot())

const stopAuthSubscription = memberAuthSession.subscribe((snapshot) => {
  authSnapshot.value = snapshot
})

onUnmounted(() => {
  stopAuthSubscription()
})

const normalizedMerchantId = computed(() => authSnapshot.value.authResult?.userInfo.merchantId?.trim() ?? '')
const currentDisplayName = computed(() => {
  const userInfo = authSnapshot.value.authResult?.userInfo

  if (!userInfo) {
    return '当前账号'
  }

  return userInfo.nickname ?? userInfo.username
})

onMounted(() => {
  void hydrateBackendAMemberAuthSession(memberAuthSession)
})

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}
</script>

<template>
  <section class="merchant-deduction-page">
    <PageTopBar title="扣款" @back="goBack" />

    <div class="content-scroll">
      <section class="hero-card">
        <span class="eyebrow">商户员工专用</span>
        <strong>线下扣款</strong>
        <p>当前页面为独立路由页，没有挂任何入口，后续在这里接金额录入、图片上传、扫码识别和扣款提交。</p>
      </section>

      <section class="info-card">
        <span>当前登录账号</span>
        <strong>{{ currentDisplayName }}</strong>
      </section>

      <section class="info-card">
        <span>商户 ID</span>
        <strong>{{ normalizedMerchantId || '当前账号未返回 merchantId' }}</strong>
      </section>

      <section class="flow-card">
        <strong>预留流程</strong>

        <ol>
          <li>填写扣款金额</li>
          <li>补充备注和上传凭证图片</li>
          <li>扫描用户付款码</li>
          <li>提交扣款</li>
        </ol>
      </section>
    </div>
  </section>
</template>

<style scoped>
.merchant-deduction-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(231, 111, 81, 0.18), transparent 32%),
    linear-gradient(180deg, #fff9f4 0%, #f2ede7 100%);
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
.info-card,
.flow-card {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(27, 25, 22, 0.08);
}

.hero-card,
.info-card {
  margin-bottom: 12px;
}

.eyebrow {
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-card strong,
.flow-card strong,
.info-card strong {
  color: #1f1d1a;
}

.hero-card strong {
  font-size: 22px;
  line-height: 1.2;
}

.hero-card p,
.info-card span,
.flow-card ol {
  margin: 0;
  color: #78716c;
  font-size: 13px;
  line-height: 1.6;
}

.info-card strong {
  font-size: 18px;
  line-height: 1.5;
  word-break: break-all;
}

.flow-card ol {
  padding-left: 18px;
}

.flow-card li + li {
  margin-top: 8px;
}
</style>
