<script setup lang="ts">
import SectionCard from '@/shared/ui/SectionCard.vue'

const promotionAreas = [
  '优惠券池与可领取活动',
  '商品卡促销标识与落地页编排',
  '结算页折扣和优惠文案联动',
]
</script>

<template>
  <section class="promotion-page">
    <header class="intro">
      <p class="eyebrow">Promotion Module</p>
      <h1>营销活动模块入口</h1>
      <p class="summary">
        promotion 模块可以按租户启用或停用。路由注册表启用后，导航和页面入口会自动出现。
      </p>
    </header>

    <SectionCard title="能力范围" description="promotion 常与 catalog、checkout 联动。">
      <ul class="capability-list">
        <li v-for="area in promotionAreas" :key="area">{{ area }}</li>
      </ul>
    </SectionCard>
  </section>
</template>

<style scoped>
.promotion-page {
  display: grid;
  gap: 24px;
}

.intro {
  display: grid;
  gap: 12px;
  max-width: 720px;
}

.eyebrow {
  margin: 0;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.8rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.08;
}

.summary {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.8;
}

.capability-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-left: 20px;
  color: var(--color-text-soft);
}
</style>
