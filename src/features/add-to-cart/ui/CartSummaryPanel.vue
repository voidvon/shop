<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { currentBackendLabel } from '@/shared/config/backend'
import { useModuleAvailability } from '@/shared/lib/modules'
import { formatCurrency } from '@/shared/lib/currency'
import SectionCard from '@/shared/ui/SectionCard.vue'

import { useCartStore } from '../model/useCartStore'

const cartStore = useCartStore()
const isCartEnabled = useModuleAvailability('cart')
const { errorMessage, hasLoaded, isLoading, itemCount, lines, subtotal } = storeToRefs(cartStore)

const visibleLines = computed(() => lines.value.slice(0, 4))

onMounted(() => {
  if (isCartEnabled.value && !hasLoaded.value) {
    void cartStore.loadSnapshot()
  }
})
</script>

<template>
  <SectionCard
    title="购物车概览"
    :description="`商品能力仍由 ${currentBackendLabel} 装配，购物车状态当前仅保存在浏览器本地。`"
  >
    <p v-if="!isCartEnabled" class="state">当前租户未启用 cart 模块，这块能力可以整体抽离。</p>

    <template v-else>
    <div class="stats">
      <div>
        <span>商品件数</span>
        <strong>{{ itemCount }}</strong>
      </div>
      <div>
        <span>小计金额</span>
        <strong>{{ formatCurrency(subtotal) }}</strong>
      </div>
    </div>

    <p v-if="isLoading" class="state">正在同步购物车...</p>
    <p v-else-if="errorMessage" class="state error">{{ errorMessage }}</p>
    <p v-else-if="visibleLines.length === 0" class="state">购物车还是空的，先挑一件商品试试。</p>

    <ul v-else class="line-list">
      <li v-for="line in visibleLines" :key="line.productId">
        <div>
          <strong>{{ line.productName }}</strong>
          <span>{{ line.quantity }} 件</span>
        </div>
        <em>{{ formatCurrency(line.lineTotal) }}</em>
      </li>
    </ul>
    </template>
  </SectionCard>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stats div {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-line);
  background: rgba(255, 255, 255, 0.76);
}

.stats span,
.stats strong {
  display: block;
}

.stats span {
  color: var(--color-text-soft);
  font-size: 0.82rem;
}

.stats strong {
  margin-top: 4px;
  font-size: 1.35rem;
}

.state {
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-soft);
}

.error {
  color: var(--color-primary-deep);
}

.line-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.line-list li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-line);
  background: rgba(255, 255, 255, 0.58);
}

.line-list strong,
.line-list span,
.line-list em {
  display: block;
}

.line-list span {
  margin-top: 4px;
  color: var(--color-text-soft);
  font-style: normal;
  font-size: 0.86rem;
}

.line-list em {
  align-self: center;
  font-style: normal;
  font-weight: 700;
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .line-list li {
    flex-direction: column;
  }
}
</style>
