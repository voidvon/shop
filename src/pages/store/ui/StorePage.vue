<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { formatCurrency } from '@/shared/lib/currency'
import EmptyState from '@/shared/ui/EmptyState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useStorePageModel } from '../model/useStorePageModel'

const route = useRoute()
const router = useRouter()

const storeId = computed(() => String(route.params.storeId ?? ''))
const preferredStoreName = computed(() =>
  typeof route.query.name === 'string' ? route.query.name : null,
)
const tabs = [
  { key: 'home', label: '店铺首页' },
  { key: 'all-products', label: '全部商品' },
  { key: 'new-products', label: '最新商品' },
  { key: 'promotions', label: '促销活动' },
] as const

const {
  activeTab,
  errorMessage,
  heroImageUrl,
  isEmpty,
  isLoading,
  keyword,
  loadStorePage,
  selectTab,
  storeBenefits,
  storeName,
  storeStats,
  visibleProducts,
} = useStorePageModel(storeId, preferredStoreName)

function goBack() {
  if (globalThis.window?.history.state?.back) {
    router.back()
    return
  }

  void router.push('/')
}
</script>

<template>
  <section class="store-page">
    <header class="store-top-bar">
      <button class="nav-button" type="button" aria-label="返回上一页" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>

      <strong>店铺详情</strong>

      <button class="nav-button" type="button" aria-label="刷新店铺数据" @click="loadStorePage">
        <van-icon name="replay" size="18" />
      </button>
    </header>

    <div class="store-scroll">
      <section class="store-hero">
        <div class="store-hero-backdrop" :style="heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined" />
        <div class="store-hero-overlay" />

        <div class="store-hero-content">
          <div class="store-identity">
            <div class="store-logo">{{ storeName.slice(0, 1) }}</div>

            <div class="store-copy">
              <span class="store-badge">商家主页</span>
              <h1>{{ storeName }}</h1>
              <p>从商品详情页进入的店铺展示页，优先呈现店内可售商品与主推好物。</p>
            </div>
          </div>

          <div class="store-stats">
            <div class="store-stat">
              <strong>{{ storeStats.productCount }}</strong>
              <span>全部商品</span>
            </div>
            <div class="store-stat">
              <strong>{{ storeStats.onSaleCount }}</strong>
              <span>在售数量</span>
            </div>
            <div class="store-stat">
              <strong>{{ storeStats.monthlySales }}</strong>
              <span>累计月销</span>
            </div>
          </div>

          <div class="benefit-row">
            <span v-for="benefit in storeBenefits" :key="benefit" class="benefit-chip">{{ benefit }}</span>
          </div>
        </div>
      </section>

      <section class="store-panel">
        <SearchField
          v-model="keyword"
          aria-label="搜索店内商品"
          class="store-search"
          placeholder="搜索店内商品、分类或标签"
          variant="outlined"
        />

        <div class="tab-row" role="tablist" aria-label="店铺内容切换">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-button"
            :class="{ 'tab-button-active': activeTab === tab.key }"
            type="button"
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <p v-if="errorMessage" class="status-card">
          {{ errorMessage }}
        </p>

        <div v-else-if="isLoading" class="product-grid">
          <div v-for="index in 6" :key="index" class="product-card product-card-skeleton">
            <van-skeleton avatar avatar-shape="square" title :row="2" />
          </div>
        </div>

        <EmptyState
          v-else-if="isEmpty"
          class="store-empty"
          description="当前店铺还没有可展示的商品，稍后再来看看。"
          description-width="220px"
          icon="shop-o"
          title="暂无店铺商品"
        />

        <div v-else class="product-grid">
          <RouterLink
            v-for="product in visibleProducts"
            :key="product.id"
            class="product-card"
            :to="{ name: 'product-detail', params: { productId: product.id } }"
          >
            <img
              class="product-image"
              :src="product.coverImageUrl || '/images/image-placeholder.svg'"
              :alt="product.name"
            >

            <div class="product-copy">
              <strong>{{ product.name }}</strong>
              <p>{{ product.summary || product.category }}</p>
            </div>

            <div class="product-meta">
              <span class="product-price">{{ formatCurrency(product.price) }}</span>
              <span class="product-sales">月销 {{ product.monthlySales }}</span>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.store-page {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(245, 158, 11, 0.18), transparent 34%),
    linear-gradient(180deg, #fbf7f0 0%, #f4efe7 100%);
}

.store-top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 24px;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  background: rgba(251, 247, 240, 0.92);
  backdrop-filter: blur(14px);
}

.store-top-bar strong {
  color: #2f241b;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #6a5342;
}

.store-scroll {
  display: grid;
  gap: 18px;
  padding: 0 0 28px;
}

.store-hero {
  position: relative;
  overflow: hidden;
  min-height: 268px;
  margin: 0 14px;
  border-radius: 28px;
  background: linear-gradient(135deg, #2f241b 0%, #7c4a2c 55%, #d17f1f 100%);
  box-shadow: 0 18px 40px rgba(61, 36, 18, 0.2);
}

.store-hero-backdrop,
.store-hero-overlay {
  position: absolute;
  inset: 0;
}

.store-hero-backdrop {
  background-position: center;
  background-size: cover;
  opacity: 0.18;
  transform: scale(1.06);
}

.store-hero-overlay {
  background:
    linear-gradient(180deg, rgba(20, 14, 9, 0.05) 0%, rgba(20, 14, 9, 0.68) 100%),
    radial-gradient(circle at top right, rgba(255, 231, 179, 0.38), transparent 34%);
}

.store-hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 18px;
  padding: 22px 20px 20px;
}

.store-identity {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.store-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 22px;
  background: rgba(255, 248, 234, 0.16);
  color: #fff8eb;
  font-size: 26px;
  font-weight: 800;
  text-transform: uppercase;
}

.store-copy {
  display: grid;
  gap: 8px;
}

.store-badge {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 243, 214, 0.16);
  color: #ffe7b3;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.store-copy h1 {
  margin: 0;
  color: #fffaf2;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
}

.store-copy p {
  margin: 0;
  color: rgba(255, 245, 228, 0.78);
  font-size: 13px;
  line-height: 1.6;
}

.store-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.store-stat {
  display: grid;
  gap: 6px;
  padding: 14px 12px;
  border-radius: 18px;
  background: rgba(255, 248, 234, 0.12);
}

.store-stat strong {
  color: #fff8eb;
  font-size: 20px;
  font-weight: 800;
}

.store-stat span {
  color: rgba(255, 245, 228, 0.74);
  font-size: 12px;
}

.benefit-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.benefit-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 248, 234, 0.14);
  color: #fff5e4;
  font-size: 12px;
  font-weight: 600;
}

.store-panel {
  display: grid;
  gap: 16px;
  padding: 0 14px;
}

.store-search {
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 10px 24px rgba(54, 33, 20, 0.06);
}

.tab-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.tab-row::-webkit-scrollbar {
  display: none;
}

.tab-button {
  flex: none;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #7a6858;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.tab-button-active {
  border-color: rgba(209, 127, 31, 0.22);
  background: #fff;
  color: #a24c14;
  box-shadow: 0 8px 20px rgba(209, 127, 31, 0.12);
}

.status-card {
  margin: 0;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  color: #8a3b12;
  font-size: 14px;
  line-height: 1.6;
}

.store-empty {
  min-height: 240px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.product-card {
  display: grid;
  gap: 12px;
  padding: 12px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 30px rgba(54, 33, 20, 0.08);
  text-decoration: none;
}

.product-card-skeleton {
  min-height: 248px;
}

.product-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  object-fit: cover;
  background: #f2ede6;
}

.product-copy {
  display: grid;
  gap: 6px;
}

.product-copy strong {
  color: #24180f;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.product-copy p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #8c7a69;
  font-size: 12px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.product-price {
  color: #b45309;
  font-size: 15px;
  font-weight: 800;
}

.product-sales {
  color: #9a8a7a;
  font-size: 11px;
}

@media (max-width: 360px) {
  .store-stats,
  .product-grid {
    grid-template-columns: 1fr;
  }

  .store-identity {
    grid-template-columns: 1fr;
  }
}
</style>
