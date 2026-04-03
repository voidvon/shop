<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast, showToast } from 'vant'

import {
  submitMemberWechatLogin,
  MemberLoginPanel,
} from '@/features/member-auth'
import { useMemberAuthRepository, useMemberAuthSession } from '@/entities/member-auth'
import {
  consumePendingWechatLoginRedirectPath,
  consumePendingWechatLoginState,
  isWechatBrowser,
  startWechatOauthLogin,
} from '@/shared/lib/wechat-browser'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const route = useRoute()
const router = useRouter()
const memberAuthRepository = useMemberAuthRepository()
const memberAuthSession = useMemberAuthSession()
const isWechatAuthorizing = ref(false)
let hasHandledWechatCode = false

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/member'
})

function resolveWechatLoginRedirectPath() {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect
  }

  return consumePendingWechatLoginRedirectPath() ?? '/member'
}

const wechatCode = computed(() => {
  const code = route.query.code
  return typeof code === 'string' ? code : ''
})

const wechatState = computed(() => {
  const state = route.query.state
  return typeof state === 'string' ? state : ''
})

const registerRoute = computed(() => ({
  name: 'member-register',
  query: { redirect: redirectPath.value },
}))

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/')
}

function goHome() {
  void router.push('/')
}

async function handleSubmitted() {
  await router.replace(redirectPath.value)
}

async function triggerWechatOauthIfNeeded() {
  if (!isWechatBrowser() || wechatCode.value) {
    return
  }

  const result = await startWechatOauthLogin(redirectPath.value)

  if (result.redirected) {
    isWechatAuthorizing.value = true
    return
  }

  if (result.succeeded) {
    if (result.successMessage) {
      showSuccessToast(result.successMessage)
    }

    await router.replace(redirectPath.value)
    return
  }

  if (result.message) {
    showToast(result.message)
  }
}

watch(wechatCode, async (code) => {
  if (!code || hasHandledWechatCode) {
    return
  }

  const expectedState = consumePendingWechatLoginState()

  if (expectedState && wechatState.value && expectedState !== wechatState.value) {
    showFailToast('微信登录状态校验失败，请重试')
    return
  }

  hasHandledWechatCode = true
  isWechatAuthorizing.value = true

  try {
    const result = await submitMemberWechatLogin(code, {
      repository: memberAuthRepository,
      session: memberAuthSession,
    })
    showSuccessToast(result.successMessage)
    await router.replace(resolveWechatLoginRedirectPath())
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '微信登录失败')
  } finally {
    isWechatAuthorizing.value = false
  }
}, { immediate: true })

onMounted(() => {
  void triggerWechatOauthIfNeeded()
})
</script>

<template>
  <section class="auth-page">
    <PageTopBar title="会员登录" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="auth-scroll">
      <MemberLoginPanel
        :is-wechat-authorizing="isWechatAuthorizing"
        :register-route="registerRoute"
        @submitted="handleSubmitted"
      />
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top left, rgba(184, 92, 56, 0.16), transparent 34%),
    linear-gradient(180deg, #fcf7f0 0%, #f6ede0 100%);
  overflow: hidden;
}

.auth-scroll {
  min-height: 0;
  padding: 18px 16px 32px;
  overflow-y: auto;
}
</style>
