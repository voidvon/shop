<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { formatCurrency } from '@/shared/lib/currency'
import ImageCarousel from '@/shared/ui/ImageCarousel.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useHomePageModel } from '../model/useHomePageModel'

const {
  displayedHotProducts,
  errorMessage,
  homePageData,
  isHotProductsFinished,
  isLoading,
  isLoadingMoreHotProducts,
  loadHomePage,
  loadMoreHotProducts,
} = useHomePageModel()
const carouselItems = computed(() =>
  homePageData.value.banners.map((banner) => ({
    ...banner,
    imageUrl: banner.imageUrl || '/favicon.ico',
  })),
)
const quickCategories = computed(() => homePageData.value.quickCategories.slice(0, 8))
const loadMoreTriggerRef = ref<HTMLElement | null>(null)

function tryLoadMoreOnScroll() {
  if (
    typeof window === 'undefined'
    || !loadMoreTriggerRef.value
    || isLoading.value
    || isLoadingMoreHotProducts.value
    || isHotProductsFinished.value
  ) {
    return
  }

  const triggerTop = loadMoreTriggerRef.value.getBoundingClientRect().top
  const viewportBottom = window.innerHeight + 160

  if (triggerTop <= viewportBottom) {
    void loadMoreHotProducts()
  }
}

onMounted(() => {
  void loadHomePage()

  window.addEventListener('scroll', tryLoadMoreOnScroll, { passive: true })
  window.addEventListener('resize', tryLoadMoreOnScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', tryLoadMoreOnScroll)
  window.removeEventListener('resize', tryLoadMoreOnScroll)
})

watch(
  () => displayedHotProducts.value.length,
  async () => {
    await nextTick()
    tryLoadMoreOnScroll()
  },
)
</script>

<template>
  <section class="home-page">
    <van-sticky>
      <div class="sticky-search">
        <div class="sticky-search-inner">
          <SearchField placeholder="搜索商品" />
        </div>
      </div>
    </van-sticky>

    <div class="content-wrapper">
      <ImageCarousel :bleed-x="'48px'" :items="carouselItems" />

      <section class="category-grid">
        <RouterLink
          v-for="category in quickCategories"
          :key="category.id"
          class="category-card"
          :to="{ name: 'category', params: { primaryCategoryId: category.id } }"
        >
          <img :src="category.imageUrl || '/favicon.ico'" :alt="category.label">
          <strong>{{ category.label }}</strong>
        </RouterLink>
      </section>

      <section class="product-section">
        <div class="section-head">
          <h2>热门推荐</h2>
        </div>

        <p v-if="errorMessage" class="status-text">
          {{ errorMessage }}
        </p>

        <p v-else-if="isLoading" class="status-text">
          首页推荐加载中...
        </p>

        <div
          v-else-if="displayedHotProducts.length > 0"
          class="hot-product-list"
        >
          <div class="product-grid">
            <RouterLink
              v-for="product in displayedHotProducts"
              :key="product.id"
              class="product-card"
              :to="{ name: 'product-detail', params: { productId: product.id } }"
            >
              <img :src="product.imageUrl || '/favicon.ico'" :alt="product.name">
              <strong>{{ product.name }}</strong>
              <div class="price-row">
                <span>{{ formatCurrency(product.price) }}</span>
                <small v-if="product.marketPrice">{{ formatCurrency(product.marketPrice) }}</small>
              </div>
            </RouterLink>
          </div>

          <div
            ref="loadMoreTriggerRef"
            class="load-more-trigger"
            :class="{ 'load-more-trigger-finished': isHotProductsFinished }"
          >
            <span v-if="isLoadingMoreHotProducts">加载更多推荐中...</span>
            <span v-else-if="isHotProductsFinished">已经到底了</span>
            <span v-else>继续下滑加载更多</span>
          </div>
        </div>

        <p v-else class="status-text">
          暂无热门推荐
        </p>
      </section>

      <van-back-top class="home-back-top" :bottom="104" :right="24" />
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
  padding: 12px 24px calc(24px + var(--app-bottom-nav-offset, 0px));
}

.sticky-search {
  background: #f5f4f1;
}

.sticky-search-inner {
  padding: 16px 24px 12px;
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
  color: inherit;
  text-decoration: none;
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

.hot-product-list {
  display: grid;
  gap: 14px;
}

.status-text {
  margin: 0;
  padding: 20px 12px;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
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

.load-more-trigger {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
  color: #9c9b99;
  font-size: 12px;
}

.load-more-trigger-finished {
  padding-bottom: 12px;
}

@media (min-width: 760px) {
  .home-page {
    border-radius: 24px;
    overflow: hidden;
  }
}
</style>

<style>
.home-back-top {
  --van-back-top-background: var(--color-accent);
  --van-back-top-text-color: #fff;
}
</style>
