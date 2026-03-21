<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { formatCurrency } from '@/shared/lib/currency'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useCategoryPageModel } from '../model/useCategoryPageModel'

const {
  activePrimaryCategory,
  activeSecondaryCategory,
  errorMessage,
  isLoading,
  keyword,
  loadCategoryPage,
  primaryCategories,
  secondaryCategories,
  selectPrimaryCategory,
  selectSecondaryCategory,
  selectedPrimaryCategoryId,
  selectedSecondaryCategoryId,
  visibleProducts,
} = useCategoryPageModel()

onMounted(() => {
  void loadCategoryPage()
})
</script>

<template>
  <section class="category-page">
    <PageTopBar :show-back="false" title="分类" />

    <header class="header">
      <SearchField
        v-model="keyword"
        aria-label="搜索商品分类"
        placeholder="搜索商品或子分类"
        variant="outlined"
      />

      <div class="chip-row">
        <button
          v-for="category in primaryCategories"
          :key="category.id"
          class="chip"
          :class="{ 'chip-active': category.id === selectedPrimaryCategoryId }"
          type="button"
          @click="selectPrimaryCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </div>
    </header>

    <section class="main-panel">
      <aside class="category-rail" aria-label="子分类">
        <button
          v-for="category in secondaryCategories"
          :key="category.id"
          class="category-pill"
          :class="{ 'category-pill-active': category.id === selectedSecondaryCategoryId }"
          type="button"
          @click="selectSecondaryCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </aside>

      <div class="content-pane">
        <header class="content-header">
          <strong>{{ activeSecondaryCategory?.label || activePrimaryCategory?.label || '分类商品' }}</strong>
          <span>{{ activePrimaryCategory?.label || '全部分类' }}</span>
        </header>

        <p v-if="errorMessage" class="status-text">
          {{ errorMessage }}
        </p>

        <p v-else-if="isLoading" class="status-text">
          分类数据加载中...
        </p>

        <p v-else-if="secondaryCategories.length === 0" class="status-text">
          当前父分类下暂无子分类
        </p>

        <p v-else-if="visibleProducts.length === 0" class="status-text">
          当前子分类下暂无商品
        </p>

        <div v-else class="product-grid">
          <RouterLink
            v-for="product in visibleProducts"
            :key="`${activeSecondaryCategory?.id || activePrimaryCategory?.id}-${product.id}`"
            class="product-card"
            :to="{ name: 'product-detail', params: { productId: product.id } }"
          >
            <img :src="product.imageUrl || '/favicon.ico'" :alt="product.name">
            <div class="name-wrapper">
              <strong>{{ product.name }}</strong>
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
  display: grid;
  align-content: start;
  gap: 12px;
  padding-top: 8px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.content-pane::-webkit-scrollbar {
  display: none;
}

.content-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.content-header strong {
  color: #1f1d1b;
  font-size: 18px;
  font-weight: 700;
}

.content-header span {
  color: #9c9b99;
  font-size: 12px;
}

.status-text {
  margin: 0;
  padding: 20px 0;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
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
