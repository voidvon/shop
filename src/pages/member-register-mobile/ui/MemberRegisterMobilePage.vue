<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { MemberMobileRegisterPanel, type MemberRegisterMode } from '@/features/member-auth'
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

const normalRegisterRoute = computed(() => ({
  name: 'member-register',
  query: { redirect: redirectPath.value },
}))

const activeMode = computed<MemberRegisterMode>(() => 'mobile')

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push(normalRegisterRoute.value)
}

function goHome() {
  void router.push('/')
}

function handleModeChange(name: 'default' | 'mobile') {
  if (name === 'default') {
    void router.replace(normalRegisterRoute.value)
  }
}

async function handleSubmitted() {
  await router.replace(redirectPath.value)
}
</script>

<template>
  <section class="auth-page">
    <PageTopBar title="手机注册" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="auth-scroll">
      <MemberMobileRegisterPanel
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
    radial-gradient(circle at top left, rgba(47, 107, 95, 0.14), transparent 30%),
    linear-gradient(180deg, #fbf8f2 0%, #f1e7d8 100%);
  overflow: hidden;
}

.auth-scroll {
  min-height: 0;
  padding: 18px 16px 32px;
  overflow-y: auto;
}
</style>
