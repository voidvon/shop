<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { MemberLoginPanel } from '@/features/member-auth'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const route = useRoute()
const router = useRouter()

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/member'
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
</script>

<template>
  <section class="auth-page">
    <PageTopBar title="会员登录" right-icon="wap-home-o" @back="goBack" @right="goHome" />

    <div class="auth-scroll">
      <MemberLoginPanel :register-route="registerRoute" @submitted="handleSubmitted" />
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
