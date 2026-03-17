<script setup lang="ts">
import { useEnabledModuleManifests } from '@/shared/lib/modules'
import SectionCard from '@/shared/ui/SectionCard.vue'

const boundaryRules = [
  'pages 只做装配，不直接写远程请求或业务规则。',
  'features 负责用户动作与界面状态编排，例如检索商品目录。',
  'entities 封装商品实体、仓储契约、用例和基础展示。',
  'shared 仅保留导航、格式化、基础布局等无业务语义能力。',
]
const enabledModuleManifests = useEnabledModuleManifests()
</script>

<template>
  <section class="showcase">
    <div class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Shop Architecture Baseline</p>
        <h1>把模板工程改成可扩展的 FSD + DDD 骨架</h1>
        <p class="summary">
          首页保留“商品目录”这个最小业务场景，用真实切片替代模板示例，后续可以继续向购物车、订单、
          用户中心扩展，而不再把逻辑堆进页面。
        </p>
      </div>
      <SectionCard title="边界约束" description="每一层都只保留自己该负责的内容。">
        <ul class="rules">
          <li v-for="rule in boundaryRules" :key="rule">
            {{ rule }}
          </li>
        </ul>
      </SectionCard>
    </div>

    <SectionCard
      title="运行时模块"
      description="模块启用由前端配置与后端能力共同决定，首页和导航都消费同一份 manifest。"
    >
      <ul class="module-grid">
        <li v-for="moduleItem in enabledModuleManifests" :key="moduleItem.id" class="module-item">
          <div class="module-item-head">
            <strong>{{ moduleItem.label }}</strong>
            <span>{{ moduleItem.entry }}</span>
          </div>
          <p>{{ moduleItem.summary }}</p>
          <small>
            依赖：
            {{ moduleItem.dependsOn.length > 0 ? moduleItem.dependsOn.join(' / ') : 'none' }}
          </small>
        </li>
      </ul>
    </SectionCard>

  </section>
</template>

<style scoped>
.showcase {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 24px;
  align-items: start;
}

.hero-copy {
  padding: 8px 4px;
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.8rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  line-height: 1.02;
  max-width: 10ch;
}

.summary {
  max-width: 54ch;
  margin: 18px 0 0;
  font-size: 1.04rem;
  line-height: 1.8;
  color: var(--color-text-soft);
}

.rules {
  display: grid;
  gap: 12px;
  padding-left: 20px;
  margin: 0;
  color: var(--color-text-soft);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.module-item {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.64);
}

.module-item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.module-item strong,
.module-item span,
.module-item p,
.module-item small {
  display: block;
}

.module-item span,
.module-item small {
  color: var(--color-text-soft);
}

.module-item span {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.76rem;
}

.module-item p,
.module-item small {
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  h1 {
    max-width: 13ch;
  }
}
</style>
