<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { formatCurrency } from '@/shared/lib/currency'
import { mockProducts } from '@/shared/mocks'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import SearchField from '@/shared/ui/SearchField.vue'

const chips = [
  { id: 'seasonal', label: '当季上新', active: true },
  { id: 'sensitive', label: '敏感肌友好', active: false },
  { id: 'cleanser', label: '洁面清单', active: false },
  { id: 'repair', label: '熬夜修护', active: false },
  { id: 'stability', label: '换季维稳', active: false },
  { id: 'primer', label: '妆前打底', active: false },
] as const

const categoryDefinitions = [
  { id: 'skincare', label: '护肤' },
  { id: 'makeup', label: '彩妆' },
  { id: 'fragrance', label: '香氛' },
  { id: 'care', label: '个护' },
  { id: 'tools', label: '工具' },
  { id: 'serum', label: '精华' },
  { id: 'mask', label: '面膜' },
  { id: 'sun', label: '防晒' },
  { id: 'lotion', label: '水乳' },
  { id: 'remover', label: '卸妆' },
] as const

const visibleCardCount = 8

function getCycledProduct(index: number) {
  const product = mockProducts[index % mockProducts.length]

  if (!product) {
    throw new Error('Missing mock product for category page.')
  }

  return product
}

const categoryGroups = categoryDefinitions.map((category, index) => ({
  ...category,
  products: Array.from({ length: visibleCardCount }, (_, offset) => getCycledProduct(index + offset)),
}))

const selectedCategoryId = ref(categoryGroups[0]?.id ?? '')

const activeCategory = computed(
  () => categoryGroups.find((category) => category.id === selectedCategoryId.value) ?? categoryGroups[0],
)

const visibleProducts = computed(() => activeCategory.value?.products ?? [])
</script>

<template>
  <section class="category-page">
    <PageTopBar :show-back="false" title="分类" />

    <header class="header">
      <SearchField aria-label="搜索商品分类" placeholder="搜索品牌、功效、场景" readonly variant="outlined" />

      <div class="chip-row">
        <button
          v-for="chip in chips"
          :key="chip.id"
          class="chip"
          :class="{ 'chip-active': chip.active }"
          type="button"
        >
          {{ chip.label }}
        </button>
      </div>
    </header>

    <section class="main-panel">
      <aside class="category-rail" aria-label="一级分类">
        <button
          v-for="category in categoryGroups"
          :key="category.id"
          class="category-pill"
          :class="{ 'category-pill-active': category.id === selectedCategoryId }"
          type="button"
          @click="selectedCategoryId = category.id"
        >
          {{ category.label }}
        </button>
      </aside>

      <div class="content-pane">
        <div class="product-grid">
          <RouterLink
            v-for="product in visibleProducts"
            :key="`${activeCategory?.id}-${product.productId}`"
            class="product-card"
            :to="{ name: 'product-detail', params: { productId: product.productId } }"
          >
            <img :src="product.imageUrl" :alt="product.productName">
            <div class="name-wrapper">
              <strong>{{ product.productName }}</strong>
            </div>
            <div class="price-row">
              <span>{{ formatCurrency(product.price) }}</span>
              <small v-if="product.marketPrice">{{ formatCurrency(product.marketPrice) }}</small>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.category-page {
  display: grid;
  grid-template-rows: 49px auto minmax(0, 1fr);
  gap: 16px;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #fafaf9;
}

.header {
  display: grid;
  gap: 16px;
  padding: 0 16px;
}

.chip-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.chip-row::-webkit-scrollbar {
  display: none;
}

.chip {
  flex: none;
  padding: 8px 12px;
  border: 0;
  border-radius: 999px;
  background: #f1f1f1;
  color: #78716c;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.chip-active {
  background: #fee7da;
  color: #ea580c;
}

.main-panel {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
  padding: 0 16px;
  overflow: hidden;
}

.category-rail {
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 8px 0 96px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.category-rail::-webkit-scrollbar {
  display: none;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 10px;
  border: 0;
  border-radius: 18px;
  background: #f1f1f1;
  color: #78716c;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

.category-pill-active {
  background: #fee7da;
  color: #ea580c;
  font-weight: 700;
}

.content-pane {
  padding-top: 8px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.content-pane::-webkit-scrollbar {
  display: none;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 8px;
  padding-bottom: 96px;
}

.product-card {
  display: grid;
  gap: 8px;
  padding: 0 0 8px;
  border-radius: 12px;
  background: #fff;
}

.product-card img {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  object-fit: cover;
  background: #edecea;
}

.name-wrapper,
.price-row {
  padding: 0 8px;
}

.name-wrapper strong {
  display: block;
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
}

.price-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.price-row span {
  color: #d08068;
  font-size: 16px;
  font-weight: 600;
}

.price-row small {
  color: #9c9b99;
  font-size: 13px;
  text-decoration: line-through;
}
</style>
