<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useMemberFavoriteStore } from '@/entities/member-favorite'
import { ProductCompactCard } from '@/entities/product'
import EmptyState from '@/shared/ui/EmptyState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useStoreSearchResultsPageModel } from '../model/useStoreSearchResultsPageModel'

const router = useRouter()
const memberFavoriteStore = useMemberFavoriteStore()
const {
  applyKeyword,
  errorMessage,
  hotKeywords,
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

function handleKeywordSelect(nextKeyword: string) {
  applyKeyword(nextKeyword)
  void submitSearch(nextKeyword)
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

      <p v-else-if="isLoading" class="status-text">
        搜索结果加载中...
      </p>

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
            :name="product.name"
            :price="product.price"
            :to="{ name: 'product-detail', params: { productId: product.id } }"
          />
        </div>
      </template>

      <section v-else class="empty-wrap">
        <EmptyState
          description="换个关键词试试，也可以继续浏览下面的热门搜索。"
          description-width="240px"
          icon="search"
          title="没有找到相关商品"
        />

        <div class="keyword-grid">
          <button
            v-for="item in hotKeywords"
            :key="item"
            class="keyword-chip"
            type="button"
            @click="handleKeywordSelect(item)"
          >
            {{ item }}
          </button>
        </div>
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
  background: #f7f4ef;
}

.search-header {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee7dc;
}

.header-button,
.search-submit,
.keyword-chip {
  padding: 0;
  border: 0;
  background: transparent;
}

.header-button {
  color: #3c3b39;
}

.search-input {
  min-width: 0;
}

.search-submit {
  color: #ea580c;
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
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: #6d6c6a;
  font-size: 13px;
}

.summary-row strong {
  color: #1a1918;
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
  display: grid;
  gap: 20px;
  padding-top: 48px;
}

.keyword-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.keyword-chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff2e8;
  color: #c2410c;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 360px) {
  .summary-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
