<script setup lang="ts">
import { useRouter } from 'vue-router'

import { usePlatformSettingsStore } from '@/processes/storefront'
import { formatCurrency } from '@/shared/lib/currency'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useSearchResultsPageModel } from '../model/useSearchResultsPageModel'

const router = useRouter()
const platformSettingsStore = usePlatformSettingsStore()
const {
  errorMessage,
  isLoading,
  keyword,
  results,
  submitSearch,
} = useSearchResultsPageModel()

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/search')
}

function handleSubmit() {
  void submitSearch()
}
</script>

<template>
  <section class="search-results-page">
    <header class="search-header">
      <button class="header-button" type="button" aria-label="返回上一页" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>

      <SearchField
        v-model="keyword"
        class="search-input"
        aria-label="搜索商城商品"
        placeholder="搜索商品名称或分类关键词"
        variant="outlined"
        @submit="handleSubmit"
      />

      <button class="search-submit" type="button" @click="handleSubmit">搜索</button>
    </header>

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <LoadingState v-else-if="isLoading" />

      <template v-else-if="results.length > 0">
        <div class="summary-row">
          <strong>共找到 {{ results.length }} 个相关商品</strong>
          <span>关键词：{{ keyword }}</span>
        </div>

        <div class="result-list">
          <RouterLink
            v-for="product in results"
            :key="product.id"
            class="result-card"
            :to="{ name: 'product-detail', params: { productId: product.id } }"
          >
            <img :src="product.imageUrl || '/images/image-placeholder.svg'" :alt="product.name">

            <div class="result-copy">
              <strong>{{ product.name }}</strong>
              <span>{{ product.categoryName }}</span>
              <div class="price-row">
                <em>{{ formatCurrency(product.priceText ?? product.price) }}</em>
                <small v-if="product.marketPrice">{{ formatCurrency(product.marketPriceText ?? product.marketPrice) }}</small>
                <span v-if="platformSettingsStore.showSalesCount" class="sales-inline">销量 {{ product.monthlySales }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </template>

      <section v-else class="empty-wrap">
        <EmptyState
          description="换个关键词试试。"
          description-width="240px"
          icon="search"
          title="没有找到相关商品"
        />
      </section>
    </div>
  </section>
</template>

<style scoped>
.search-results-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-bg-strong);
}

.search-header {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-line-warm);
}

.header-button,
.search-submit {
  padding: 0;
  border: 0;
  background: transparent;
}

.header-button {
  color: var(--color-text);
}

.search-input {
  min-width: 0;
}

.search-submit {
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
}

.content-scroll {
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.status-text {
  margin: 0;
  padding: 20px 0;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: var(--color-text-soft);
  font-size: 13px;
}

.summary-row strong {
  color: var(--color-text-strong);
  font-size: 15px;
}

.result-list {
  display: grid;
  gap: 12px;
}

.result-card {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 14px;
  padding: 12px;
  border-radius: 18px;
  background: var(--color-surface-elevated);
  color: inherit;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(var(--shadow-rgb), 0.05);
}

.result-card img {
  width: 96px;
  height: 96px;
  border-radius: 14px;
  object-fit: cover;
}

.result-copy {
  display: grid;
  align-content: start;
  gap: 8px;
}

.sales-inline {
  margin-left: auto;
  color: var(--color-text-subtle);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.result-copy strong {
  color: var(--color-text-strong);
  font-size: 15px;
  line-height: 1.4;
}

.result-copy span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-row em {
  color: var(--color-primary);
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
}

.price-row small {
  color: var(--color-text-disabled);
  font-size: 12px;
  text-decoration: line-through;
}

.empty-wrap {
  padding-top: 48px;
}
</style>
