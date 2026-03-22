<script setup lang="ts">
import { useRouter } from 'vue-router'

import { CheckoutFlowPanel } from '@/processes/checkout-flow'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const router = useRouter()

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/cart')
}
</script>

<template>
  <section class="checkout-page">
    <PageTopBar title="确认订单" @back="goBack" />

    <div class="checkout-scroll">
      <CheckoutFlowPanel />
    </div>
  </section>
</template>

<style scoped>
.checkout-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top left, rgba(255, 138, 31, 0.14), transparent 32%),
    linear-gradient(180deg, #fbf7f2 0%, #f6efe5 100%);
  overflow: hidden;
}

.checkout-scroll {
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
}
</style>
