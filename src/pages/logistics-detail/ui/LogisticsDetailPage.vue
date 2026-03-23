<script setup lang="ts">
import { useRouter } from 'vue-router'

import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const router = useRouter()

function goBack() {
  if (globalThis.window?.history.state?.back) {
    router.back()
    return
  }

  void router.push({ name: 'member-orders' })
}
</script>

<template>
  <section class="logistics-detail-page">
    <PageTopBar title="物流详情" @back="goBack" />

    <div class="content-wrap">
      <EmptyState
        description="当前版本暂未接入物流轨迹能力，后续可在这里展示物流公司、运单号和节点轨迹。"
        description-width="260px"
        icon="logistics"
        layout="fill"
        title="物流详情暂未开放"
      />
    </div>
  </section>
</template>

<style scoped>
.logistics-detail-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(180deg, #f8f3ec 0%, #f4ede3 100%);
}

.content-wrap {
  min-height: 0;
}
</style>
