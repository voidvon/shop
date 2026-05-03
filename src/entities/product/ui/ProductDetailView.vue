<script setup lang="ts">
import { computed } from 'vue'

import { formatCurrency } from '@/shared/lib/currency'

import { isHighDemandProduct, type ProductDetail } from '../domain/product'

const props = defineProps<{
  product: ProductDetail
}>()

const demandLabel = computed(() => (isHighDemandProduct(props.product) ? '高需求' : '稳定供应'))
</script>

<template>
  <article class="product-detail">
    <header class="hero">
      <div class="headline">
        <p class="category">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p v-if="product.subtitle?.trim()" class="summary">{{ product.subtitle }}</p>

        <div class="hero-meta">
          <van-tag round type="primary">{{ demandLabel }}</van-tag>
          <span>月销 {{ product.monthlySales }}</span>
          <span>库存 {{ product.inventory }}</span>
          <strong>{{ formatCurrency(product.price) }}</strong>
        </div>
      </div>

      <div class="service-panel">
        <span class="service-title">服务保障</span>
        <ul>
          <li v-for="service in product.serviceLabels" :key="service">
            <van-tag plain type="success">{{ service }}</van-tag>
          </li>
        </ul>
      </div>
    </header>

    <section class="detail-grid">
      <div class="detail-block">
        <h2>详情描述</h2>
        <p>{{ product.detailDescription }}</p>
      </div>

      <div class="detail-block">
        <h2>核心卖点</h2>
        <ul class="selling-points">
          <li v-for="point in product.sellingPoints" :key="point">{{ point }}</li>
        </ul>
      </div>
    </section>

    <section v-if="product.attributes.length" class="detail-block">
      <h2>商品属性</h2>
      <dl class="attributes">
        <template v-for="attribute in product.attributes" :key="attribute.label">
          <dt>{{ attribute.label }}</dt>
          <dd>{{ attribute.value }}</dd>
        </template>
      </dl>
    </section>

    <section v-if="product.tags.length" class="detail-block">
      <h2>标签</h2>
      <ul class="tags">
        <li v-for="tag in product.tags" :key="tag">
          <van-tag plain type="warning">{{ tag }}</van-tag>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.product-detail {
  display: grid;
  gap: 18px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.8fr);
  gap: 18px;
}

.headline,
.service-panel,
.detail-block {
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-line);
  background: rgba(255, 251, 245, 0.75);
}

.category {
  margin: 0 0 8px;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-accent);
}

h1,
h2 {
  margin: 0;
}

h1 {
  font-size: clamp(1.6rem, 2vw, 2.2rem);
}

h2 {
  font-size: 1rem;
}

.summary,
.detail-block p {
  margin: 12px 0 0;
  color: var(--color-text-soft);
  line-height: 1.8;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
}

.hero-meta span,
.hero-meta strong {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
}

.service-title {
  display: block;
  margin-bottom: 12px;
  font-weight: 700;
}

.service-panel ul,
.selling-points,
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.attributes {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px 16px;
  margin: 0;
}

.attributes dt {
  color: var(--color-text-soft);
}

.attributes dd {
  margin: 0;
  font-weight: 600;
}

@media (max-width: 860px) {
  .hero,
  .detail-grid,
  .attributes {
    grid-template-columns: 1fr;
  }
}
</style>
