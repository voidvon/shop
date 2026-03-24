<script setup lang="ts">
import { computed } from 'vue'
import { showToast, type PopoverAction } from 'vant'
import { useRoute, useRouter } from 'vue-router'

import { ProductCompactCard } from '@/entities/product'
import { normalizeSearchKeyword } from '@/shared/lib/search-history'
import EmptyState from '@/shared/ui/EmptyState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useStorePageModel } from '../model/useStorePageModel'

const route = useRoute()
const router = useRouter()
const topActions: PopoverAction[] = [
  { text: '刷新店铺', value: 'refresh' },
  { text: '返回首页', value: 'home' },
]
const footerActions = [
  { key: 'store', icon: 'shop-o', label: '店铺信息' },
  { key: 'coupon', icon: 'coupon-o', label: '奖励领券' },
  { key: 'service', icon: 'service-o', label: '联系客服' },
  { key: 'about', icon: 'info-o', label: '关于我们' },
] as const

const storeId = computed(() => String(route.params.storeId ?? ''))
const preferredStoreName = computed(() =>
  typeof route.query.name === 'string' ? route.query.name : null,
)

const {
  activeTab,
  errorMessage,
  heroImageUrl,
  isEmpty,
  isLoading,
  isStoreFavorited,
  keyword,
  loadStorePage,
  storeAddress,
  storeBenefits,
  storeLogoUrl,
  storeName,
  storePhone,
  storeStats,
  tabs,
  toggleStoreFavorite: toggleStoreFavoriteState,
  visibleProducts,
} = useStorePageModel(storeId, preferredStoreName)

const primaryBenefit = computed(() => storeBenefits.value[0] ?? '支持售后无忧')
const storeSummary = computed(() => {
  if (storeStats.value.productCount === 0) {
    return '店铺正在整理上新中'
  }

  return `${storeStats.value.productCount} 款商品 · 月销 ${storeStats.value.monthlySales}`
})
const sectionTitle = computed(() => {
  if (activeTab.value === 'all-products') {
    return '全部商品'
  }

  if (activeTab.value === 'new-products') {
    return '最新上架'
  }

  if (activeTab.value === 'promotions') {
    return '促销活动'
  }

  return '店主推荐'
})

function goBack() {
  if (globalThis.window?.history.state?.back) {
    router.back()
    return
  }

  void router.push('/')
}

function handleToggleStoreFavorite() {
  toggleStoreFavoriteState()
  showToast(isStoreFavorited.value ? '已关注店铺' : '已取消关注')
}

function handleTopAction(action: PopoverAction) {
  if (action.value === 'refresh') {
    void loadStorePage()
    return
  }

  void router.push('/')
}

function handleFooterAction(actionKey: (typeof footerActions)[number]['key']) {
  if (actionKey === 'store') {
    globalThis.window?.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const actionMap = {
    about: storeAddress.value ?? '店铺介绍暂未配置',
    coupon: '领券功能暂未开放',
    service: storePhone.value ? `联系电话 ${storePhone.value}` : '客服入口暂未开放',
  } as const

  showToast(actionMap[actionKey as keyof typeof actionMap])
}

function handleSearchSubmit() {
  const normalizedKeyword = normalizeSearchKeyword(keyword.value)

  if (!normalizedKeyword) {
    showToast('请输入搜索关键词')
    return
  }

  void router.push({
    name: 'store-search-results',
    params: {
      storeId: storeId.value,
    },
    query: {
      keyword: normalizedKeyword,
      ...(storeName.value ? { name: storeName.value } : {}),
    },
  })
}
</script>

<template>
  <section class="store-page">
    <header class="store-top-bar">
      <button class="nav-button" type="button" aria-label="返回上一页" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>

      <SearchField
        v-model="keyword"
        aria-label="搜索店内商品"
        class="store-search"
        placeholder="搜索店铺内商品"
        variant="soft"
        @submit="handleSearchSubmit"
      />

      <van-popover :actions="topActions" placement="bottom-end" teleport="body" @select="handleTopAction">
        <template #reference>
          <button class="nav-button nav-button-accent" type="button" aria-label="更多店铺操作">
            <van-icon name="bars" size="20" />
          </button>
        </template>
      </van-popover>
    </header>

    <div class="store-scroll">
      <section class="store-hero">
        <div
          class="store-hero-backdrop"
          :style="heroImageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(43, 37, 33, 0.56), rgba(43, 37, 33, 0.56)), url(${heroImageUrl})` } : undefined"
        />

        <div class="store-hero-content">
          <div class="store-identity">
            <div class="store-logo">
              <img v-if="storeLogoUrl" :src="storeLogoUrl" :alt="storeName" class="store-logo-image">
              <van-icon v-else name="shop-o" size="28" />
            </div>

            <div class="store-copy">
              <h1>{{ storeName }}</h1>
              <p>{{ storeSummary }}</p>
              <span class="store-benefit">{{ primaryBenefit }}</span>
            </div>
          </div>

          <van-button class="follow-button" round size="small" type="default" @click="handleToggleStoreFavorite">
            {{ isStoreFavorited ? '取消收藏' : '收藏店铺' }}
          </van-button>
        </div>
      </section>

      <section class="store-panel">
        <div class="store-tabs-shell">
          <van-tabs v-model:active="activeTab">
            <van-tab
              v-for="tab in tabs"
              :key="tab"
              :name="tab"
              :title="tab === 'home'
                ? '店铺首页'
                : tab === 'all-products'
                  ? '全部商品'
                  : tab === 'new-products'
                    ? '最新商品'
                    : '促销活动'"
            />
          </van-tabs>
        </div>

        <div class="store-panel-content">
          <header class="section-head">
            <span class="section-accent" />
            <strong>{{ sectionTitle }}</strong>
          </header>

          <p v-if="errorMessage" class="status-card">
            {{ errorMessage }}
          </p>

          <div v-else-if="isLoading" class="product-grid">
            <div v-for="index in 6" :key="index" class="product-card-skeleton">
              <div class="product-skeleton-media" />
              <div class="product-skeleton-line product-skeleton-line-name" />
              <div class="product-skeleton-line product-skeleton-line-price" />
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
            <ProductCompactCard
              v-for="product in visibleProducts"
              :key="product.id"
              :image-url="product.coverImageUrl"
              :market-price="product.price + 10"
              :name="product.name"
              :price="product.price"
              :to="{ name: 'product-detail', params: { productId: product.id } }"
            />
          </div>
        </div>
      </section>
    </div>

    <footer class="store-action-bar" aria-label="店铺快捷操作">
      <button
        v-for="action in footerActions"
        :key="action.key"
        class="store-action-item"
        type="button"
        @click="handleFooterAction(action.key)"
      >
        <van-icon :name="action.icon" size="20" />
        {{ action.label }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.store-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 402px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f4f1;
  overflow-x: clip;
}

.store-page *,
.store-page *::before,
.store-page *::after {
  box-sizing: border-box;
}

.store-top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eeeae5;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
}

.nav-button {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7e7a76;
}

.nav-button-accent {
  color: #f08a3e;
}

.store-scroll {
  display: grid;
  gap: 16px;
  width: 100%;
  padding: 12px 0 calc(90px + env(safe-area-inset-bottom, 0px));
}

.store-search {
  flex: 1;
  min-width: 0;
}

.store-hero {
  position: relative;
  overflow: hidden;
  width: calc(100% - 32px);
  margin: 0 16px;
  border-radius: 18px;
  min-height: 146px;
  background: linear-gradient(180deg, #5a4033 0%, #2b2521 100%);
}

.store-hero-backdrop {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  opacity: 0.28;
}

.store-hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 16px;
}

.store-identity {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.store-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  background: #d93a2f;
  color: #fff;
}

.store-logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.store-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.store-copy h1 {
  margin: 0;
  overflow: hidden;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-copy p {
  margin: 0;
  color: #f4eee8;
  font-size: 13px;
  font-weight: 500;
}

.store-benefit {
  color: #ffd7b3;
  font-size: 12px;
  font-weight: 600;
}

.follow-button {
  flex: none;
  --van-button-default-height: 36px;
  --van-button-default-border-color: rgba(255, 255, 255, 0.92);
  --van-button-default-color: #2b2521;
  --van-button-default-background: rgba(255, 255, 255, 0.92);
  font-weight: 600;
}

.store-panel {
  display: grid;
  gap: 10px;
  width: calc(100% - 32px);
  margin: 0 16px;
}

.store-panel-content {
  display: grid;
  gap: 16px;
}

.store-tabs-shell {
  overflow: hidden;
  padding-top: 6px;
  border-radius: 18px;
  background: #fff;
}

.store-tabs-shell :deep(.van-tabs__nav--line) {
  padding-bottom: 10px;
}

.store-tabs-shell :deep(.van-tabs__line) {
  bottom: 10px;
}

.section-head {
  display: flex;
  gap: 8px;
  align-items: center;
}

.section-accent {
  width: 3px;
  height: 20px;
  border-radius: 2px;
  background: #4ea7ff;
}

.section-head strong {
  color: #2f2a26;
  font-size: 24px;
  font-weight: 700;
}

.status-card {
  margin: 0;
  padding: 16px 0;
  background: transparent;
  color: #8a3b12;
  font-size: 14px;
  line-height: 1.6;
}

.store-empty {
  min-height: 240px;
  border-radius: 18px;
  background: #faf8f6;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.product-card-skeleton {
  display: grid;
  gap: 12px;
}

.product-skeleton-media {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f2f0ed 25%, #f8f6f3 37%, #f2f0ed 63%);
}

.product-skeleton-line {
  height: 14px;
  border-radius: 999px;
  background: #f1eeea;
}

.product-skeleton-line-name {
  width: 75%;
}

.product-skeleton-line-price {
  width: 45%;
}

.store-action-bar {
  position: sticky;
  bottom: 0;
  z-index: 12;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  width: 100%;
  padding: 8px 10px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #eeeae5;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
}

.store-action-item {
  display: grid;
  gap: 4px;
  justify-items: center;
  min-width: 0;
  padding: 6px 0 0;
  border: 0;
  background: transparent;
  color: #9c9b99;
  font-size: 10px;
  font-weight: 500;
}

@media (max-width: 360px) {
  .store-top-bar,
  .store-hero-content,
  .store-identity {
    align-items: flex-start;
  }

  .store-hero-content {
    flex-direction: column;
  }

  .follow-button {
    width: 100%;
  }
}
</style>
