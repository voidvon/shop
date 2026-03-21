<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { MemberCardBindPanel } from '@/features/member-card-binding'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCardBindPageModel } from '../model/useMemberCardBindPageModel'

const router = useRouter()
const { loadMemberCardBindPage, memberCardBindPageData } = useMemberCardBindPageModel()
const cardNumber = ref('')

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

watch(
  () => memberCardBindPageData.value.cardNumber,
  (value) => {
    if (value && !cardNumber.value) {
      cardNumber.value = value
    }
  },
  { immediate: true },
)

onMounted(() => {
  void loadMemberCardBindPage()
})
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
