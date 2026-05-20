<script setup lang="ts">
import { useRouter } from 'vue-router'

import { CheckoutFlowPanel } from '@/processes/checkout-flow'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const router = useRouter()

function goBack() {
  if (globalThis.window?.history.state?.back) {
    router.back()
    return
  }

  void router.push('/cart')
}
</script>

<template>
  <section class="checkout-page">
    <PageTopBar title="确认订单" @back="goBack" />
    <CheckoutFlowPanel class="checkout-panel" />
  </section>
</template>

<style scoped>
.checkout-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top left, rgba(var(--color-primary-rgb), 0.14), transparent 32%),
    linear-gradient(180deg, var(--color-surface-strong) 0%, var(--color-surface-soft) 100%);
  overflow: hidden;
}

.checkout-panel {
  min-height: 0;
}
</style>
