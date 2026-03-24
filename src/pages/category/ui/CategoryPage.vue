<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { useMemberFavoriteStore } from '@/entities/member-favorite'
import { formatCurrency } from '@/shared/lib/currency'
import EmptyState from '@/shared/ui/EmptyState.vue'
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
          'content-pane-empty':
            !errorMessage && !isLoading && (secondaryCategories.length === 0 || visibleProducts.length === 0),
        }"
      >
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
          <RouterLink
            v-for="product in visibleProducts"
            :key="`${activeSecondaryCategory?.id || activePrimaryCategory?.id}-${product.id}`"
            class="product-card"
            :to="{ name: 'product-detail', params: { productId: product.id } }"
          >
            <span v-if="isProductFavorited(product.id)" class="favorite-badge">
              <van-icon name="like" size="12" />
              已收藏
            </span>
            <img :src="product.imageUrl || '/images/image-placeholder.svg'" :alt="product.name">
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
  gap: 14px;
  padding: 0 16px;
}

.chip-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 6px;
  border: 1px solid #ece5db;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 6px 18px rgba(26, 25, 24, 0.04);
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
  background: #f7f3ee;
  color: #6d6c6a;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.chip-active {
  background: #fff;
  border-color: #f3cfb5;
  color: #ea580c;
  box-shadow: 0 4px 10px rgba(234, 88, 12, 0.08);
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
  border: 1px solid #ece4da;
  border-radius: 6px;
  background: linear-gradient(180deg, #f4efe8 0%, #f9f6f2 100%);
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
  color: #7b746d;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
}

.category-pill-active {
  background: #fff;
  color: #ea580c;
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

.content-pane-empty {
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
  border-bottom: 1px solid #f1ece6;
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
  padding: 20px 4px;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
}

.content-empty-state {
  padding-bottom: var(--app-bottom-nav-offset, 96px);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 8px;
  padding-bottom: 96px;
}

.product-card {
  position: relative;
  display: grid;
  gap: 8px;
  padding: 0 0 8px;
  border-radius: 12px;
  background: #fff;
}

.favorite-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.96);
  color: #c2410c;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
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
