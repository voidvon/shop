<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { formatCurrency } from '@/shared/lib/currency'
import { mockPublicData } from '@/shared/mocks'
import ImageCarousel from '@/shared/ui/ImageCarousel.vue'
import SearchField from '@/shared/ui/SearchField.vue'

const { homePageData } = mockPublicData
const hotProducts = homePageData.productFeed.list.slice(0, 4)
const quickCategories = [
  { key: 'fashion', label: '服装' },
  { key: 'home', label: '家居' },
  { key: 'digital', label: '数码' },
  { key: 'books', label: '图书' },
  { key: 'beauty', label: '美妆' },
  { key: 'sport', label: '运动' },
  { key: 'food', label: '食品' },
  { key: 'baby', label: '母婴' },
] as const

function scrollToTop() {
  globalThis.window?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section class="home-page">
    <div class="content-wrapper">
      <SearchField placeholder="搜索商品" readonly />

      <ImageCarousel :bleed-x="'48px'" :items="homePageData.banners" />

      <section class="category-grid">
        <article v-for="category in quickCategories" :key="category.key" class="category-card">
          <img src="/favicon.ico" :alt="category.label">
          <strong>{{ category.label }}</strong>
        </article>
      </section>

      <section class="product-section">
        <div class="section-head">
          <h2>热门推荐</h2>
        </div>

        <div class="product-grid">
          <RouterLink
            v-for="product in hotProducts"
            :key="product.productId"
            class="product-card"
            :to="{ name: 'product-detail', params: { productId: product.productId } }"
          >
            <img :src="product.productImageUrl" :alt="product.productName">
            <strong>{{ product.productName }}</strong>
            <div class="price-row">
              <span>{{ formatCurrency(product.price) }}</span>
              <small v-if="product.marketPrice">{{ formatCurrency(product.marketPrice) }}</small>
            </div>
          </RouterLink>
        </div>
      </section>

      <button class="back-top" type="button" @click="scrollToTop">
        <van-icon name="back-top" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  display: grid;
  gap: 0;
  width: 100%;
  min-height: calc(100vh - 110px);
  background: #f5f4f1;
}

.content-wrapper {
  display: grid;
  gap: 24px;
  padding: 16px 24px 24px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.category-card {
  display: grid;
  gap: 6px;
  justify-items: center;
  text-align: center;
}

.category-card img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #edecea;
}

.category-card strong {
  color: #1a1918;
  font-size: 12px;
  font-weight: 500;
}

.product-section {
  display: grid;
  gap: 16px;
}

.section-head h2 {
  margin: 0;
  color: #1a1918;
  font-size: 18px;
  font-weight: 600;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.product-card {
  display: grid;
  gap: 8px;
  padding: 0 0 8px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.product-card img {
  width: 100%;
  height: 140px;
  background: #edecea;
}

.product-card strong,
.price-row {
  padding: 0 8px;
}

.product-card strong {
  color: #1a1918;
  font-size: 14px;
  font-weight: 500;
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

.back-top {
  position: sticky;
  bottom: 88px;
  justify-self: end;
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 50%;
  background: #3d8a5a;
  color: #fff;
  box-shadow: 0 12px 24px rgba(61, 138, 90, 0.25);
}

@media (min-width: 760px) {
  .home-page {
    border-radius: 24px;
    overflow: hidden;
  }
}
</style>
