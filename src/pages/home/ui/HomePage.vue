<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useMemberFavoriteStore } from '@/entities/member-favorite'
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
const router = useRouter()
const memberFavoriteStore = useMemberFavoriteStore()
const promoVideoRef = ref<HTMLVideoElement | null>(null)
const promoVideoUrl = computed(() => homePageData.value.promo_video)
const carouselItems = computed(() =>
  homePageData.value.banners.map((banner) => ({
    ...banner,
    imageUrl: banner.imageUrl || '/images/image-placeholder.svg',
  })),
)
const quickCategories = computed(() => homePageData.value.quickCategories)
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

async function ensurePromoVideoPlayback() {
  if (!promoVideoUrl.value) {
    return
  }

  await nextTick()

  const video = promoVideoRef.value

  if (!video) {
    return
  }

  video.muted = true
  video.defaultMuted = true
  video.playsInline = true

  try {
    await video.play()
  } catch {
    // iOS may still defer autoplay in some visibility states.
  }
}

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
  syncFavoriteState()
  void ensurePromoVideoPlayback()

  window.addEventListener('scroll', tryLoadMoreOnScroll, { passive: true })
  window.addEventListener('resize', tryLoadMoreOnScroll)
})

onActivated(() => {
  syncFavoriteState(true)
  void ensurePromoVideoPlayback()
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

watch(promoVideoUrl, () => {
  void ensurePromoVideoPlayback()
})
</script>

<template>
  <section class="home-page">
    <van-sticky>
      <div class="sticky-search">
        <div class="sticky-search-inner">
          <SearchField placeholder="搜索商品" readonly @click="goToSearchPage" />
        </div>
      </div>
    </van-sticky>

    <div class="content-wrapper">
      <section v-if="promoVideoUrl" class="promo-video-card">
        <video
          ref="promoVideoRef"
          class="promo-video-player"
          :src="promoVideoUrl"
          autoplay
          controlslist="nodownload nofullscreen noremoteplayback"
          disablepictureinpicture
          loop
          muted
          playsinline
          webkit-playsinline="true"
          preload="metadata"
        />
      </section>

      <ImageCarousel v-else :bleed-x="'48px'" :items="carouselItems" />

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
              <span v-if="isProductFavorited(product.id)" class="favorite-badge">
                <van-icon name="like" size="12" />
                已收藏
              </span>
              <img :src="product.imageUrl || '/images/image-placeholder.svg'" :alt="product.name">
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

      <van-back-top class="home-back-top" teleport="" />
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

.promo-video-card {
  overflow: hidden;
  border-radius: 16px;
  background: #111;
  box-shadow: 0 10px 24px rgba(17, 17, 17, 0.14);
}

.promo-video-player {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
  object-fit: cover;
  pointer-events: none;
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
  position: relative;
  display: grid;
  gap: 8px;
  padding: 0 0 8px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.favorite-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.96);
  color: #c2410c;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
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
  --van-back-top-right: 24px;
  --van-back-top-bottom: calc(24px + var(--app-bottom-nav-offset, 0px));
}
</style>
