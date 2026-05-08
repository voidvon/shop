<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useMemberFavoriteStore } from '@/entities/member-favorite'
import { ProductCompactCard } from '@/entities/product'
import { useCustomerServiceUnreadStore } from '@/processes/customer-service'
import ImageCarousel from '@/shared/ui/ImageCarousel.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useHomePageModel } from '../model/useHomePageModel'

const {
  displayedHotProducts,
  errorMessage,
  homePageData,
  isHotProductsFinished,
  isLoading,
  isRefreshing,
  isLoadingMoreHotProducts,
  loadHomePage,
  loadMoreHotProducts,
} = useHomePageModel()
const router = useRouter()
const memberFavoriteStore = useMemberFavoriteStore()
const customerServiceUnreadStore = useCustomerServiceUnreadStore()
const carouselItems = computed(() =>
  homePageData.value.banners.map((banner) => ({
    imageUrl: banner.imageUrl || '/images/image-placeholder.svg',
    linkUrl: null,
  })),
)
const quickCategories = computed(() => homePageData.value.quickCategories)
const partnerStoreTypes = computed(() => homePageData.value.partnerStoreTypes)
const loadMoreTriggerRef = ref<HTMLElement | null>(null)

function isProductFavorited(productId: string) {
  return memberFavoriteStore.isProductFavorited(productId)
}

function syncFavoriteState(force = false) {
  void memberFavoriteStore.syncCurrentUserFavorites({ force })
}

function goToSearchPage() {
  void router.push({ name: 'search' })
}

function goToCustomerServicePage() {
  void router.push({ name: 'member-customer-service' })
}

async function handleRefresh() {
  await loadHomePage({ refresh: true })
  await nextTick()
  tryLoadMoreOnScroll()
}

function tryLoadMoreOnScroll() {
  if (
    typeof window === 'undefined'
    || !loadMoreTriggerRef.value
    || isLoading.value
    || isRefreshing.value
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
  syncFavoriteState()

  window.addEventListener('scroll', tryLoadMoreOnScroll, { passive: true })
  window.addEventListener('resize', tryLoadMoreOnScroll)
})

onActivated(() => {
  syncFavoriteState(true)
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
    <van-pull-refresh
      v-model="isRefreshing"
      class="home-page-refresh"
      success-text="刷新成功"
      @refresh="handleRefresh"
    >
      <van-sticky>
        <div class="sticky-search">
          <div class="sticky-search-inner">
            <SearchField
              class="sticky-search-field"
              placeholder="搜索商品"
              readonly
              @click="goToSearchPage"
            />

            <button
              class="message-entry-button"
              type="button"
              aria-label="打开消息列表"
              @click="goToCustomerServicePage"
            >
              <van-badge
                :content="customerServiceUnreadStore.totalUnreadCount > 0 ? customerServiceUnreadStore.totalUnreadCount : undefined"
                :max="99"
                :offset="[-2, 2]"
                class="message-entry-badge"
              >
                <van-icon name="chat-o" size="22" />
              </van-badge>
              <span class="message-entry-label">客服</span>
            </button>
          </div>
        </div>
      </van-sticky>

      <div class="content-wrapper">
        <ImageCarousel v-if="carouselItems.length > 0" :bleed-x="'48px'" :items="carouselItems" />

        <section class="category-grid">
          <RouterLink
            v-for="category in quickCategories"
            :key="category.id"
            class="category-card"
            :to="{ name: 'category', params: { primaryCategoryId: category.id } }"
          >
            <img :src="category.imageUrl || '/images/image-placeholder.svg'" :alt="category.label">
            <strong>{{ category.label }}</strong>
          </RouterLink>
        </section>

        <section v-if="partnerStoreTypes.length > 0" class="partner-store-type-section">
          <div class="partner-store-type-head">
            <strong>线下门店&gt;&gt;</strong>
          </div>

          <div class="partner-store-type-list">
            <RouterLink
              v-for="storeType in partnerStoreTypes"
              :key="storeType.id"
              class="partner-store-type-card"
              :class="{ 'partner-store-type-card-placeholder': !storeType.imageUrl }"
              :to="{
                name: 'partner-store-directory',
                params: { storeTypeId: storeType.id },
                query: { label: storeType.label },
              }"
            >
              <img
                class="partner-store-type-image"
                :src="storeType.imageUrl || '/images/image-placeholder.svg'"
                :alt="storeType.label"
              >
              <div v-if="!storeType.imageUrl" class="partner-store-type-overlay">
                <strong>{{ storeType.label }}</strong>
              </div>
            </RouterLink>
          </div>
        </section>

        <section class="product-section">
          <div class="section-head">
            <h2>热门推荐</h2>
          </div>

          <p v-if="errorMessage && displayedHotProducts.length === 0" class="status-text">
            {{ errorMessage }}
          </p>

          <LoadingState v-else-if="isLoading" />

          <div
            v-else-if="displayedHotProducts.length > 0"
            class="hot-product-list"
          >
            <p v-if="errorMessage" class="status-text status-text-inline">
              {{ errorMessage }}
            </p>

            <div class="product-grid">
              <ProductCompactCard
                v-for="product in displayedHotProducts"
                :key="product.id"
                :image-url="product.imageUrl"
                :is-favorited="isProductFavorited(product.id)"
                :market-price="product.marketPrice"
                :monthly-sales="product.monthlySales"
                :name="product.name"
                :price="product.price"
                :to="{ name: 'product-detail', params: { productId: product.id } }"
              />
            </div>

            <div
              ref="loadMoreTriggerRef"
              class="load-more-trigger"
              :class="{ 'load-more-trigger-finished': isHotProductsFinished }"
            >
              <span v-if="isLoadingMoreHotProducts" class="load-more-loading">
                <van-loading size="14" type="spinner" />
                <span>加载中...</span>
              </span>
              <span v-else-if="isHotProductsFinished">已经到底了</span>
              <span v-else>继续下滑加载更多</span>
            </div>
          </div>

          <p v-else class="status-text">
            暂无热门推荐
          </p>
        </section>

        <van-back-top class="home-back-top" teleport="" />
      </div>
    </van-pull-refresh>
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

.home-page-refresh {
  min-height: calc(100vh - 110px);
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
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px 24px 12px;
}

.sticky-search-field {
  flex: 1 1 auto;
  min-width: 0;
}

.message-entry-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  padding: 4px 0 3px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  color: #3c3b39;
  box-shadow: 0 8px 18px rgba(60, 59, 57, 0.08);
}

.message-entry-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.message-entry-badge :deep(.van-badge__wrapper) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.message-entry-badge :deep(.van-badge__content) {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border: 1px solid #fff;
  background: #ea580c;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}

.message-entry-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
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
  border-radius: 10px;
  background: #edecea;
  object-fit: cover;
}

.category-card strong {
  color: #1a1918;
  font-size: 12px;
  font-weight: 500;
}

.partner-store-type-section {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffaf2 0%, #f7f0e2 100%);
  box-shadow: inset 0 0 0 1px rgba(164, 121, 53, 0.08);
}

.partner-store-type-head strong {
  color: #6f4b1f;
  font-size: 14px;
  font-weight: 600;
}

.partner-store-type-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.partner-store-type-card {
  position: relative;
  overflow: hidden;
  aspect-ratio: 5 / 2;
  border-radius: 10px;
  text-decoration: none;
}

.partner-store-type-card-placeholder {
  background: #e8e0d2;
  box-shadow: 0 10px 24px rgba(111, 75, 31, 0.12);
}

.partner-store-type-card-placeholder::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(28, 24, 18, 0.18), rgba(28, 24, 18, 0.58));
}

.partner-store-type-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.partner-store-type-card-placeholder .partner-store-type-image {
  filter: blur(12px) saturate(0.88);
  transform: scale(1.08);
}

.partner-store-type-overlay {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: flex;
  align-items: flex-start;
  padding: 14px 14px 12px;
}

.partner-store-type-overlay strong {
  display: inline-flex;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  backdrop-filter: blur(10px);
}

.partner-store-type-card-placeholder .partner-store-type-overlay {
  align-items: center;
  justify-content: center;
}

.partner-store-type-card-placeholder .partner-store-type-overlay strong {
  padding: 0;
  background: none;
  border-radius: 0;
  backdrop-filter: none;
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

.status-text-inline {
  padding: 0;
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

.load-more-trigger {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
  color: #9c9b99;
  font-size: 12px;
}

.load-more-loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
  --van-back-top-right: 24px;
  --van-back-top-bottom: calc(24px + var(--app-bottom-nav-offset, 0px));
}
</style>
