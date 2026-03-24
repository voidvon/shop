<script setup lang="ts">
import { useRouter } from 'vue-router'

import { formatCurrency } from '@/shared/lib/currency'
import EmptyState from '@/shared/ui/EmptyState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useSearchResultsPageModel } from '../model/useSearchResultsPageModel'

const router = useRouter()
const {
  applyKeyword,
  errorMessage,
  hotKeywords,
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

function handleKeywordSelect(nextKeyword: string) {
  applyKeyword(nextKeyword)
  void submitSearch(nextKeyword)
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

      <p v-else-if="isLoading" class="status-text">
        搜索结果加载中...
      </p>

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
                <em>{{ formatCurrency(product.price) }}</em>
                <small v-if="product.marketPrice">{{ formatCurrency(product.marketPrice) }}</small>
              </div>
            </div>
          </RouterLink>
        </div>
      </template>

      <section v-else class="empty-wrap">
        <EmptyState
          description="换个关键词试试，也可以从下面热门搜索里继续浏览。"
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
.search-results-page {
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
  background: #fff;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(26, 25, 24, 0.05);
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

.result-copy strong {
  color: #1a1918;
  font-size: 15px;
  line-height: 1.4;
}

.result-copy span {
  color: #9c9b99;
  font-size: 12px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-row em {
  color: #ea580c;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
}

.price-row small {
  color: #c4c1bb;
  font-size: 12px;
  text-decoration: line-through;
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
</style>
