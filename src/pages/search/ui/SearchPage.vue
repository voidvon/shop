<script setup lang="ts">
import { useRouter } from 'vue-router'

import SearchField from '@/shared/ui/SearchField.vue'

import { useSearchPageModel } from '../model/useSearchPageModel'

const router = useRouter()
const {
  applyKeyword,
  clearHistory,
  historyKeywords,
  hotKeywords,
  keyword,
  removeHistory,
  submitSearch,
} = useSearchPageModel()

function goBack() {
  if (globalThis.window?.history.state?.back) {
    router.back()
    return
  }

  void router.push('/')
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
  <section class="search-page">
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

    <div class="search-body">
      <section class="keyword-section">
        <header class="section-header">
          <strong>热门搜索</strong>
        </header>

        <div class="keyword-grid">
          <button
            v-for="item in hotKeywords"
            :key="item"
            class="keyword-chip keyword-chip-hot"
            type="button"
            @click="handleKeywordSelect(item)"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="keyword-section">
        <header class="section-header">
          <strong>搜索历史</strong>
          <button
            v-if="historyKeywords.length > 0"
            class="section-action"
            type="button"
            @click="clearHistory"
          >
            清空
          </button>
        </header>

        <p v-if="historyKeywords.length === 0" class="empty-text">
          暂无搜索历史，试试热门关键词快速进入独立搜索结果页。
        </p>

        <div v-else class="history-list">
          <div v-for="item in historyKeywords" :key="item" class="history-row">
            <button class="history-keyword" type="button" @click="handleKeywordSelect(item)">
              <van-icon name="clock-o" size="14" />
              <span>{{ item }}</span>
            </button>

            <button class="history-remove" type="button" :aria-label="`删除 ${item}`" @click="removeHistory(item)">
              <van-icon name="cross" size="14" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.search-page {
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
.history-remove,
.section-action,
.keyword-chip,
.history-keyword {
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

.search-body {
  display: grid;
  gap: 18px;
  padding: 18px 16px 24px;
}

.keyword-section {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(26, 25, 24, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-header strong {
  color: #1a1918;
  font-size: 15px;
  font-weight: 700;
}

.section-action {
  color: #9c8e7f;
  font-size: 13px;
}

.keyword-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.keyword-chip {
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.keyword-chip-hot {
  background: #fff2e8;
  color: #c2410c;
}

.empty-text {
  margin: 0;
  color: #9c9b99;
  font-size: 13px;
}

.history-list {
  display: grid;
  gap: 10px;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #faf7f2;
}

.history-keyword {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3c3b39;
  font-size: 14px;
}

.history-remove {
  color: #b4b2ae;
}
</style>
