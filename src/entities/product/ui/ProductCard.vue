<script setup lang="ts">
import { computed } from 'vue'

import { formatCurrency } from '@/shared/lib/currency'

import { isHighDemandProduct, type ProductSummary } from '../domain/product'

const props = defineProps<{
  product: ProductSummary
}>()

const demandLabel = computed(() => (isHighDemandProduct(props.product) ? '高需求' : '稳定供应'))
</script>

<template>
  <article class="product-card">
    <div class="card-top">
      <div>
        <p class="category">{{ product.category }}</p>
        <h3>{{ product.name }}</h3>
      </div>
      <van-tag round type="primary">{{ demandLabel }}</van-tag>
    </div>

    <p class="description">{{ product.summary }}</p>

    <div class="meta">
      <div>
        <span>月销</span>
        <strong>{{ product.monthlySales }}</strong>
      </div>
      <div>
        <span>库存</span>
        <strong>{{ product.inventory }}</strong>
      </div>
      <div>
        <span>单价</span>
        <strong>{{ formatCurrency(product.price) }}</strong>
      </div>
    </div>

    <ul class="tags">
      <li v-for="tag in product.tags" :key="tag">
        <van-tag plain type="success">{{ tag }}</van-tag>
      </li>
    </ul>

    <div v-if="$slots.action" class="card-actions">
      <slot name="action" />
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-line);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 248, 240, 0.84) 100%);
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: start;
}

.category {
  margin: 0 0 8px;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-accent);
}

h3 {
  margin: 0;
  font-size: 1.22rem;
}

.description {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

.meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.meta div {
  padding: 12px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.72);
}

.meta span,
.meta strong {
  display: block;
}

.meta span {
  color: var(--color-text-soft);
  font-size: 0.8rem;
}

.meta strong {
  margin-top: 2px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tags li {
  display: inline-flex;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .meta {
    grid-template-columns: 1fr;
  }

  .card-actions {
    justify-content: stretch;
  }

  .card-actions :deep(.van-button) {
    width: 100%;
  }
}
</style>
