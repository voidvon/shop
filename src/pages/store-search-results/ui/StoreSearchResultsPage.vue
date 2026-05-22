<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useMemberFavoriteStore } from '@/entities/member-favorite'
import { ProductCompactCard } from '@/entities/product'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useStoreSearchResultsPageModel } from '../model/useStoreSearchResultsPageModel'

const router = useRouter()
const memberFavoriteStore = useMemberFavoriteStore()
const {
  errorMessage,
  isLoading,
  keyword,
  results,
  storeId,
  storeName,
  submitSearch,
} = useStoreSearchResultsPageModel()

const resolvedStoreTitle = computed(() => storeName.value || `店铺 ${storeId.value}`)

function isProductFavorited(productId: string) {
  return memberFavoriteStore.isProductFavorited(productId)
}

function syncFavoriteState(force = false) {
  void memberFavoriteStore.syncCurrentUserFavorites({ force })
}

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({
    name: 'store-detail',
    params: {
      storeId: storeId.value,
    },
    query: {
      ...(storeName.value ? { name: storeName.value } : {}),
    },
  })
}

function handleSubmit() {
  void submitSearch()
}

onMounted(() => {
  syncFavoriteState()
})

onActivated(() => {
  syncFavoriteState(true)
})
</script>

<template>
  <section class="store-search-results-page">
    <header class="search-header">
      <button class="header-button" type="button" aria-label="返回店铺首页" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>

      <SearchField
        v-model="keyword"
        class="search-input"
        aria-label="搜索店内商品"
        placeholder="搜索店内商品"
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
          <strong>{{ resolvedStoreTitle }} 内找到 {{ results.length }} 个商品</strong>
          <span>关键词：{{ keyword }}</span>
        </div>

        <div class="result-grid">
          <ProductCompactCard
            v-for="product in results"
            :key="product.id"
            :image-url="product.imageUrl"
            :is-favorited="isProductFavorited(product.id)"
            :market-price="product.marketPrice"
            :market-price-text="product.marketPriceText"
            :monthly-sales="product.monthlySales"
            :name="product.name"
            :price="product.price"
            :price-text="product.priceText"
            :to="{ name: 'product-detail', params: { productId: product.id } }"
          />
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
.store-search-results-page {
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

.summary-row span {
  text-align: right;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: calc(24px + var(--app-bottom-nav-offset, 0px));
}

.empty-wrap {
  padding-top: 48px;
}

@media (max-width: 360px) {
  .summary-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
