<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { MemberRegisterPanel, type MemberRegisterMode } from '@/features/member-auth'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const route = useRoute()
const router = useRouter()

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/member'
})

const loginRoute = computed(() => ({
  name: 'member-login',
  query: { redirect: redirectPath.value },
}))

const mobileRegisterRoute = computed(() => ({
  name: 'member-register-mobile',
  query: { redirect: redirectPath.value },
}))

const activeMode = computed<MemberRegisterMode>(() => 'default')

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push(loginRoute.value)
}

function goHome() {
  void router.push('/')
}

function handleModeChange(name: 'default' | 'mobile') {
  if (name === 'mobile') {
    void router.replace(mobileRegisterRoute.value)
  }
}

async function handleSubmitted() {
  await router.replace(redirectPath.value)
}
</script>

<template>
  <section class="auth-page">
    <PageTopBar title="会员注册" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="auth-scroll">
      <MemberRegisterPanel
        :active-mode="activeMode"
        :login-route="loginRoute"
        @mode-change="handleModeChange"
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
    radial-gradient(circle at top right, rgba(47, 107, 95, 0.14), transparent 30%),
    linear-gradient(180deg, #fcf7f0 0%, #f4ecdf 100%);
  overflow: hidden;
}

.auth-scroll {
  min-height: 0;
  padding: 18px 16px 32px;
  overflow-y: auto;
}
</style>
