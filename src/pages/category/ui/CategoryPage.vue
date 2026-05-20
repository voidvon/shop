<script setup lang="ts">
import { onActivated, onMounted } from 'vue'

import { useMemberFavoriteStore } from '@/entities/member-favorite'
import { ProductCompactCard } from '@/entities/product'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
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
const memberFavoriteStore = useMemberFavoriteStore()

function isProductFavorited(productId: string) {
  return memberFavoriteStore.isProductFavorited(productId)
}

function syncFavoriteState(force = false) {
  void memberFavoriteStore.syncCurrentUserFavorites({ force })
}

onMounted(() => {
  void loadCategoryPage()
  syncFavoriteState()
})

onActivated(() => {
  syncFavoriteState(true)
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

      <div
        class="content-pane"
        :class="{
          'content-pane-fill-state':
            isLoading || (!errorMessage && !isLoading && (secondaryCategories.length === 0 || visibleProducts.length === 0)),
        }"
      >
        <header class="content-header">
          <strong>{{ activeSecondaryCategory?.label || activePrimaryCategory?.label || '分类商品' }}</strong>
          <span>{{ activePrimaryCategory?.label || '全部分类' }}</span>
        </header>

        <p v-if="errorMessage" class="status-text">
          {{ errorMessage }}
        </p>

        <LoadingState v-else-if="isLoading" fill />

        <EmptyState
          v-else-if="secondaryCategories.length === 0"
          class="content-empty-state"
          description="切换其他分类看看"
          description-width="220px"
          icon="description"
          layout="fill"
          title="当前分类暂无子分类"
        />

        <EmptyState
          v-else-if="visibleProducts.length === 0"
          class="content-empty-state"
          description="试试切换子分类或搜索其他商品"
          description-width="220px"
          icon="search"
          layout="fill"
          title="当前子分类暂无商品"
        />

        <div v-else class="product-grid">
          <ProductCompactCard
            v-for="product in visibleProducts"
            :key="`${activeSecondaryCategory?.id || activePrimaryCategory?.id}-${product.id}`"
            :image-url="product.imageUrl"
            :is-favorited="isProductFavorited(product.id)"
            :market-price="product.marketPrice"
            :monthly-sales="product.monthlySales"
            :name="product.name"
            :price="product.price"
            :to="{ name: 'product-detail', params: { productId: product.id } }"
          />
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
  background: var(--color-bg);
}

.header {
  display: grid;
  gap: 14px;
  padding: 0 16px;
}

.chip-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 6px;
  border: 1px solid var(--color-line-warm);
  border-radius: 20px;
  background: var(--color-surface-glass-solid);
  box-shadow: 0 6px 18px rgba(var(--shadow-rgb), 0.04);
  scrollbar-width: none;
}

.chip-row::-webkit-scrollbar {
  display: none;
}

.chip {
  flex: none;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--color-surface-soft);
  color: var(--color-text-soft);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.chip-active {
  background: var(--color-surface-elevated);
  border-color: var(--color-primary-soft-border);
  color: var(--color-primary);
  box-shadow: 0 4px 10px rgba(var(--color-primary-rgb), 0.08);
}

.main-panel {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 8px;
  min-height: 0;
  padding: 0 8px 12px;
  overflow: hidden;
}

.category-rail {
  display: grid;
  gap: 0;
  align-content: start;
  padding: 0 0 112px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--color-line-warm);
  border-radius: 6px;
  background: linear-gradient(180deg, var(--color-surface-muted) 0%, var(--color-surface-strong) 100%);
  scrollbar-width: none;
}

.category-rail::-webkit-scrollbar {
  display: none;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 12px 12px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--color-text-subtle);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
}

.category-pill-active {
  background: var(--color-surface-elevated);
  color: var(--color-primary);
  font-weight: 700;
}

.content-pane {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 14px 14px 0;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.content-pane-fill-state {
  grid-template-rows: auto minmax(240px, 1fr);
}

.content-pane::-webkit-scrollbar {
  display: none;
}

.content-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-line-soft);
}

.content-header strong {
  color: var(--color-text-heading);
  font-size: 18px;
  font-weight: 700;
}

.content-header span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.status-text {
  margin: 0;
  padding: 20px 4px;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}

.content-empty-state {
  padding-bottom: var(--app-bottom-nav-offset, 96px);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: 96px;
}
</style>
