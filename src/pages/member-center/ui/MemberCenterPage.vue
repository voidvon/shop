<script setup lang="ts">
import SectionCard from '@/shared/ui/SectionCard.vue'

const memberCapabilities = [
  '会员等级与权益摘要',
  '个性化价格与身份标签',
  '收货地址、发票和账户信息',
]
</script>

<template>
  <section class="member-page">
    <header class="intro">
      <p class="eyebrow">Member Module</p>
      <h1>会员中心模块入口</h1>
      <p class="summary">
        这是由模块路由注册表生成的页面入口。当前示例只放最小展示，后续可以扩成独立路由组。
      </p>
    </header>

    <SectionCard title="能力范围" description="member 模块通常是 feature 集合，不一定需要 process。">
      <ul class="capability-list">
        <li v-for="capability in memberCapabilities" :key="capability">{{ capability }}</li>
      </ul>
    </SectionCard>
  </section>
</template>

<style scoped>
.member-page {
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
  color: var(--color-accent);
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
