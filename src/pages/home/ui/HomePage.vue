<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useMemberFavoriteStore } from '@/entities/member-favorite'
import { ProductCompactCard } from '@/entities/product'
import { isWechatBrowser } from '@/shared/lib/wechat-browser'
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
const isWechat = isWechatBrowser()

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

  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
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
  video.setAttribute('muted', 'true')
  video.setAttribute('playsinline', 'true')
  video.setAttribute('webkit-playsinline', 'true')
  video.setAttribute('x5-playsinline', 'true')
  video.setAttribute('x5-video-player-type', 'h5')
  video.setAttribute('x5-video-player-fullscreen', 'false')

  try {
    await video.play()
  } catch {
    // WeChat/iOS WebView may still defer autoplay until the page becomes active.
  }
}

function handlePromoVideoVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
    return
  }

  void ensurePromoVideoPlayback()
}

function handlePromoVideoGesture() {
  void ensurePromoVideoPlayback()
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
  window.addEventListener('pageshow', handlePromoVideoGesture)
  document.addEventListener('visibilitychange', handlePromoVideoVisibilityChange)

  if (isWechat) {
    document.addEventListener('WeixinJSBridgeReady', handlePromoVideoGesture)
    document.addEventListener('touchstart', handlePromoVideoGesture, { passive: true })
  }
})

onActivated(() => {
  syncFavoriteState(true)
  void ensurePromoVideoPlayback()
})

onUnmounted(() => {
  window.removeEventListener('scroll', tryLoadMoreOnScroll)
  window.removeEventListener('resize', tryLoadMoreOnScroll)
  window.removeEventListener('pageshow', handlePromoVideoGesture)
  document.removeEventListener('visibilitychange', handlePromoVideoVisibilityChange)

  if (isWechat) {
    document.removeEventListener('WeixinJSBridgeReady', handlePromoVideoGesture)
    document.removeEventListener('touchstart', handlePromoVideoGesture)
  }
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
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
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
            <ProductCompactCard
              v-for="product in displayedHotProducts"
              :key="product.id"
              :image-url="product.imageUrl"
              :is-favorited="isProductFavorited(product.id)"
              :market-price="product.marketPrice"
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
