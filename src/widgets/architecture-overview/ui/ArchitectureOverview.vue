<script setup lang="ts">
import { acceptanceCriteria, architectureLayers, migrationSteps } from '@/shared/config/architecture'
import SectionCard from '@/shared/ui/SectionCard.vue'
</script>

<template>
  <section class="overview">
    <header class="intro">
      <p class="eyebrow">Architecture Handbook</p>
      <h1>当前项目的职责划分与迁移约束</h1>
      <p class="summary">
        这不是抽象原则清单，而是当前仓库已经落地的边界基线。后续新增功能按这套结构继续切片。
      </p>
    </header>

    <div class="grid">
      <SectionCard title="FSD 层级" description="从应用壳到共享层，依赖保持单向。">
        <div class="stack">
          <article v-for="layer in architectureLayers" :key="layer.name" class="stack-item">
            <div>
              <h2>{{ layer.name }}</h2>
              <p>{{ layer.responsibility }}</p>
            </div>
            <span>{{ layer.dependsOn }}</span>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="迁移步骤" description="继续拆真实业务时按这个顺序推进。">
        <ol class="ordered-list">
          <li v-for="step in migrationSteps" :key="step">
            {{ step }}
          </li>
        </ol>
      </SectionCard>
    </div>

    <SectionCard title="验收标准" description="每次重构或新增需求都用它做回归检查。">
      <ul class="check-list">
        <li v-for="item in acceptanceCriteria" :key="item">
          {{ item }}
        </li>
      </ul>
    </SectionCard>
  </section>
</template>

<style scoped>
.overview {
  display: grid;
  gap: 24px;
}

.intro {
  display: grid;
  gap: 12px;
  max-width: 780px;
}

.eyebrow {
  margin: 0;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.8rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2.1rem, 4.5vw, 3.8rem);
  line-height: 1.08;
}

.summary {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.stack {
  display: grid;
  gap: 14px;
}

.stack-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--color-line);
}

.stack-item h2 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.stack-item p {
  margin: 0;
  color: var(--color-text-soft);
}

.stack-item span {
  white-space: nowrap;
  align-self: start;
  font-size: 0.84rem;
  color: var(--color-primary);
}

.ordered-list,
.check-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-left: 20px;
  color: var(--color-text-soft);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .stack-item {
    flex-direction: column;
  }
}
</style>
