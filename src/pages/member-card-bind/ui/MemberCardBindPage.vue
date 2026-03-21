<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { MemberCardBindPanel } from '@/features/member-card-binding'
import { mockAccountData } from '@/shared/mocks'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const router = useRouter()
const cardNumber = ref(mockAccountData.cardBindingPageData.cardNumber ?? '')

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member-cards' })
}

function submitBind() {
  cardNumber.value = cardNumber.value.trim()
}
</script>

<template>
  <section class="member-card-bind-page">
    <PageTopBar title="绑定卡券" @back="goBack" />

    <MemberCardBindPanel v-model:card-number="cardNumber" @submit="submitBind" />
  </section>
</template>

<style scoped>
.member-card-bind-page {
  display: grid;
  grid-template-rows: 56px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

</style>
