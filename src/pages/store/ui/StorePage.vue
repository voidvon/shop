<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
  type DropdownItemOption,
  type PopoverAction,
} from 'vant'
import { useRoute, useRouter } from 'vue-router'

import { useMemberAuthSession } from '@/entities/member-auth'
import { ProductCompactCard } from '@/entities/product'
import type { MerchantCoupon } from '@/processes/storefront'
import { normalizeSearchKeyword } from '@/shared/lib/search-history'
import { isWechatBrowser, startWechatOauthLogin } from '@/shared/lib/wechat-browser'
import EmptyState from '@/shared/ui/EmptyState.vue'
import SearchField from '@/shared/ui/SearchField.vue'

import { useStorePageModel } from '../model/useStorePageModel'

const route = useRoute()
const router = useRouter()
const memberAuthSession = useMemberAuthSession()
const topActions: PopoverAction[] = [
  { text: '刷新店铺', value: 'refresh' },
  { text: '返回首页', value: 'home' },
]
const footerActions = [
  { key: 'products', icon: 'apps-o', label: '全部商品' },
  { key: 'coupon', icon: 'coupon-o', label: '优惠券' },
  { key: 'service', icon: 'service-o', label: '联系客服' },
  { key: 'about', icon: 'info-o', label: '关于我们' },
] as const

const storeId = computed(() => String(route.params.storeId ?? ''))
const preferredStoreName = computed(() =>
  typeof route.query.name === 'string' ? route.query.name : null,
)

const {
  activeTab,
  applyPriceFilter,
  categoryOptions,
  claimMerchantCoupon,
  claimingCouponId,
  couponErrorMessage,
  errorMessage,
  hasActiveProductFilters,
  heroImageUrl,
  isCouponLoading,
  isEmpty,
  isLoading,
  isLoadingMoreProducts,
  isProductsFinished,
  isStoreFavorited,
  keyword,
  loadMerchantCoupons,
  loadMoreProducts,
  loadStorePage,
  maxPriceInput,
  merchantCoupons,
  minPriceInput,
  selectedCategoryId,
  setSelectedCategory,
  resetSortOption,
  storeAddress,
  storeBenefits,
  storeBusinessHours,
  storeFollowerCount,
  storeLogoUrl,
  storeName,
  storeStats,
  resetProductFilters,
  selectTab,
  setSortOption,
  sortDirection,
  sortField,
  tabs,
  toggleStoreFavorite: toggleStoreFavoriteState,
  visibleProducts,
} = useStorePageModel(storeId, preferredStoreName)

const primaryBenefit = computed(() => storeBenefits.value[0] ?? '支持售后无忧')
const storeLogoDisplayUrl = computed(() => heroImageUrl.value ?? storeLogoUrl.value)
const couponPopupVisible = ref(false)
const filterDrawerVisible = ref(false)
const loadMoreTriggerRef = ref<HTMLElement | null>(null)
const hasMerchantCoupons = computed(() => merchantCoupons.value.length > 0)
const isAllProductsTab = computed(() => activeTab.value === 'all-products')
const comprehensiveSortOptions: DropdownItemOption[] = [
  { text: '综合排序', value: 'default' },
]
const salesSortOptions: DropdownItemOption[] = [
  { text: '销量正序', value: 'asc' },
  { text: '销量倒序', value: 'desc' },
] 
const priceSortOptions: DropdownItemOption[] = [
  { text: '价格正序', value: 'asc' },
  { text: '价格倒序', value: 'desc' },
]
const comprehensiveSortValue = computed({
  get: () => (sortField.value === 'default' ? 'default' : ''),
  set: (value) => {
    if (String(value) === 'default') {
      resetSortOption()
    }
  },
})
const salesSortValue = computed({
  get: () => (sortField.value === 'sales' ? sortDirection.value : ''),
  set: (value) => {
    handleSortChange('sales', String(value))
  },
})
const priceSortValue = computed({
  get: () => (sortField.value === 'price' ? sortDirection.value : ''),
  set: (value) => {
    handleSortChange('price', String(value))
  },
})
const storeMetaItems = computed(() => [
  {
    key: 'followers',
    label: '关注数',
    value: storeFollowerCount.value > 0 ? `${storeFollowerCount.value} 人` : '暂无',
  },
  {
    key: 'hours',
    label: '营业时间',
    value: storeBusinessHours.value ?? '待补充',
  },
  {
    key: 'address',
    label: '店铺地址',
    value: storeAddress.value ?? '待补充',
  },
])
const storeSummary = computed(() => {
  if (storeFollowerCount.value > 0) {
    return `${storeStats.value.productCount} 款商品 · ${storeFollowerCount.value} 人关注`
  }

  if (storeStats.value.productCount === 0) {
    return '店铺正在整理上新中'
  }

  return `${storeStats.value.productCount} 款商品 · 月销 ${storeStats.value.monthlySales}`
})

const productCountText = computed(() => `${visibleProducts.value.length} 件`)
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

function scrollToProductsPanel() {
  document.getElementById('store-products-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

async function openCouponPopup() {
  if (isCouponLoading.value) {
    return
  }

  const loadingToast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '正在加载优惠券...',
  })

  try {
    await loadMerchantCoupons()
  } finally {
    loadingToast.close()
  }

  if (couponErrorMessage.value) {
    showFailToast(couponErrorMessage.value)
    return
  }

  couponPopupVisible.value = true
}

function closeCouponPopup() {
  couponPopupVisible.value = false
}

function formatMoney(value: number) {
  const fixed = value.toFixed(2)
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed.replace(/0$/, '')
}

function formatCouponHeadline(coupon: MerchantCoupon) {
  if (coupon.type === 'discount' && coupon.discountRate !== null) {
    return `${formatMoney(coupon.discountRate)} 折`
  }

  if (coupon.discountAmount !== null) {
    return `减 ${formatMoney(coupon.discountAmount)} 元`
  }

  return coupon.name
}

function formatCouponCondition(coupon: MerchantCoupon) {
  if (coupon.minimumAmount <= 0) {
    return '无门槛可用'
  }

  return `满 ${formatMoney(coupon.minimumAmount)} 元可用`
}

function formatCouponScope(coupon: MerchantCoupon) {
  if (coupon.scopeType === 'product') {
    return '指定商品可用'
  }

  if (coupon.scopeType === 'category') {
    return '指定分类可用'
  }

  return '全场可用'
}

function formatCouponDate(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatCouponWindow(coupon: MerchantCoupon) {
  const start = formatCouponDate(coupon.startsAt)
  const end = formatCouponDate(coupon.endsAt)

  if (start && end) {
    return `${start} 至 ${end}`
  }

  if (end) {
    return `领取截止 ${end}`
  }

  if (start) {
    return `${start} 起可领取`
  }

  return '长期有效'
}

function isCouponExpired(coupon: MerchantCoupon) {
  if (!coupon.endsAt) {
    return false
  }

  const endTimestamp = new Date(coupon.endsAt).getTime()
  return Number.isFinite(endTimestamp) && endTimestamp < Date.now()
}

function isCouponClaimLimitReached(coupon: MerchantCoupon) {
  return coupon.perUserLimit > 0 && coupon.userCouponsCount >= coupon.perUserLimit
}

function isCouponClaimDisabled(coupon: MerchantCoupon) {
  return claimingCouponId.value === coupon.id
    || isCouponExpired(coupon)
    || isCouponClaimLimitReached(coupon)
}

function getCouponClaimButtonText(coupon: MerchantCoupon) {
  if (claimingCouponId.value === coupon.id) {
    return '领取中...'
  }

  if (isCouponExpired(coupon)) {
    return '已结束'
  }

  if (isCouponClaimLimitReached(coupon)) {
    return '已领取'
  }

  return '立即领取'
}

async function redirectToCouponLogin() {
  if (isWechatBrowser()) {
    const result = await startWechatOauthLogin(route.fullPath)

    if (result.succeeded || result.redirected) {
      return true
    }

    if (result.message) {
      showToast(result.message)
      return false
    }
  }

  showToast('登录后可领取优惠券')

  await router.push({
    name: 'member-login',
    query: {
      redirect: route.fullPath,
    },
  })

  return false
}

async function handleClaimCoupon(couponId: string) {
  if (claimingCouponId.value) {
    return
  }

  const userId = memberAuthSession.getSnapshot().authResult?.userInfo.userId

  if (!userId) {
    await redirectToCouponLogin()
    return
  }

  try {
    await claimMerchantCoupon(couponId)
    showSuccessToast('优惠券已领取')
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '优惠券领取失败')
  }
}

function handleFooterAction(actionKey: (typeof footerActions)[number]['key']) {
  if (actionKey === 'products') {
    selectTab('all-products')
    void nextTick(() => {
      scrollToProductsPanel()
    })
    return
  }

  if (actionKey === 'about') {
    void router.push({
      name: 'store-about',
      params: {
        storeId: storeId.value,
      },
      query: {
        ...(storeName.value ? { name: storeName.value } : {}),
      },
    })
    return
  }

  if (actionKey === 'service') {
    void router.push({
      name: 'member-customer-service',
      query: {
        composer: 'create',
        content: storeName.value ? `您好，我想咨询店铺“${storeName.value}”相关问题。` : undefined,
        storeId: storeId.value,
        storeName: storeName.value || undefined,
        subject: storeName.value ? `店铺咨询 · ${storeName.value}` : '店铺咨询',
      },
    })
    return
  }

  void openCouponPopup()
}

function handleSortChange(field: 'sales' | 'price', nextValue: string) {
  if (nextValue === 'asc' || nextValue === 'desc') {
    setSortOption(field, nextValue)
  }
}

function handleCategorySelect(categoryId: string) {
  setSelectedCategory(categoryId)
}

function openFilterDrawer() {
  filterDrawerVisible.value = true
}

function closeFilterDrawer() {
  filterDrawerVisible.value = false
}

function applyDrawerFilter() {
  applyPriceFilter()
  closeFilterDrawer()
}

function resetDrawerFilter() {
  resetProductFilters()
  closeFilterDrawer()
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

function tryLoadMoreOnScroll() {
  if (
    typeof window === 'undefined'
    || !loadMoreTriggerRef.value
    || isLoading.value
    || isLoadingMoreProducts.value
    || isProductsFinished.value
  ) {
    return
  }

  const triggerTop = loadMoreTriggerRef.value.getBoundingClientRect().top
  const viewportBottom = window.innerHeight + 160

  if (triggerTop <= viewportBottom) {
    void loadMoreProducts()
  }
}

onMounted(() => {
  window.addEventListener('scroll', tryLoadMoreOnScroll, { passive: true })
  window.addEventListener('resize', tryLoadMoreOnScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', tryLoadMoreOnScroll)
  window.removeEventListener('resize', tryLoadMoreOnScroll)
})

watch(
  () => [activeTab.value, visibleProducts.value.length, isProductsFinished.value],
  async () => {
    await nextTick()
    tryLoadMoreOnScroll()
  },
)
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
              <img v-if="storeLogoDisplayUrl" :src="storeLogoDisplayUrl" :alt="storeName" class="store-logo-image">
              <van-icon v-else name="shop-o" size="28" />
            </div>

            <div class="store-copy">
              <h1>{{ storeName }}</h1>
              <p>{{ storeSummary }}</p>
              <span class="store-benefit">{{ primaryBenefit }}</span>
            </div>

            <van-button class="follow-button" round size="small" type="default" @click="handleToggleStoreFavorite">
              {{ isStoreFavorited ? '取消收藏' : '收藏店铺' }}
            </van-button>
          </div>
        </div>

        <div class="store-meta-grid">
          <article v-for="item in storeMetaItems" :key="item.key" class="store-meta-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </section>
      <section id="store-products-panel" class="store-panel">
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
          <section v-if="isAllProductsTab" class="filter-toolbar" aria-label="全部商品筛选">
            <div class="sort-dropdown-shell">
              <van-dropdown-menu active-color="#c25b0a" class="sort-dropdown">
                <van-dropdown-item v-model="comprehensiveSortValue" title="综合" :options="comprehensiveSortOptions" />
                <van-dropdown-item v-model="salesSortValue" title="销量" :options="salesSortOptions" />
                <van-dropdown-item v-model="priceSortValue" title="价格" :options="priceSortOptions" />
              </van-dropdown-menu>
            </div>

            <button
              class="filter-trigger-button"
              :class="{ 'filter-trigger-button-active': hasActiveProductFilters }"
              type="button"
              @click="openFilterDrawer"
            >
              <van-icon name="filter-o" size="16" />
              <span>筛选</span>
            </button>
          </section>

          <header class="section-head section-head-spaced">
            <div class="section-title-wrap">
              <span class="section-accent" />
              <strong>{{ sectionTitle }}</strong>
            </div>

            <span class="section-count">{{ productCountText }}</span>
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
              :monthly-sales="product.monthlySales"
              :name="product.name"
              :price="product.price"
              :to="{ name: 'product-detail', params: { productId: product.id } }"
            />
          </div>

          <div
            v-if="!isEmpty && !errorMessage && visibleProducts.length > 0"
            ref="loadMoreTriggerRef"
            class="load-more-trigger"
            :class="{ 'load-more-trigger-finished': isProductsFinished }"
          >
            <span v-if="isLoadingMoreProducts" class="load-more-loading">
              <van-loading size="14" type="spinner" />
              <span>加载中...</span>
            </span>
            <span v-else-if="isProductsFinished">已经到底了</span>
            <span v-else>继续下滑加载更多</span>
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

    <van-popup
      v-model:show="couponPopupVisible"
      class="coupon-popup"
      position="bottom"
      round
      teleport="body"
    >
      <section class="coupon-sheet">
        <header class="coupon-sheet-head">
          <div>
            <strong>商家优惠券</strong>
            <p>实时读取当前商家可领取优惠券</p>
          </div>

          <button class="coupon-sheet-close" type="button" aria-label="关闭优惠券面板" @click="closeCouponPopup">
            <van-icon name="cross" size="18" />
          </button>
        </header>

        <div class="coupon-sheet-body">
          <p v-if="couponErrorMessage" class="status-card status-card-inline">
            {{ couponErrorMessage }}
          </p>

          <div v-else-if="isCouponLoading" class="coupon-list">
            <article v-for="index in 3" :key="index" class="coupon-card coupon-card-skeleton">
              <div class="coupon-card-main">
                <div class="coupon-skeleton-line coupon-skeleton-line-title" />
                <div class="coupon-skeleton-line coupon-skeleton-line-copy" />
                <div class="coupon-skeleton-line coupon-skeleton-line-copy" />
              </div>
              <div class="coupon-skeleton-button" />
            </article>
          </div>

          <EmptyState
            v-else-if="!hasMerchantCoupons"
            class="coupon-empty"
            description="当前商家暂未发布可领取优惠券。"
            description-width="220px"
            icon="coupon-o"
            title="暂无可领优惠券"
          />

          <div v-else class="coupon-list">
            <article v-for="coupon in merchantCoupons" :key="coupon.id" class="coupon-card">
              <div class="coupon-card-main">
                <span class="coupon-card-type">
                  {{ coupon.type === 'discount' ? '折扣券' : '满减券' }}
                </span>
                <strong>{{ formatCouponHeadline(coupon) }}</strong>
                <p>{{ coupon.name }}</p>

                <div class="coupon-card-meta">
                  <span>{{ formatCouponCondition(coupon) }}</span>
                  <span>{{ formatCouponScope(coupon) }}</span>
                  <span>{{ formatCouponWindow(coupon) }}</span>
                  <span>每人限领 {{ coupon.perUserLimit }} 张，已领 {{ coupon.userCouponsCount }} 张</span>
                </div>
              </div>

              <button
                class="coupon-claim-button"
                :class="{ 'coupon-claim-button-disabled': isCouponClaimDisabled(coupon) }"
                :disabled="isCouponClaimDisabled(coupon)"
                type="button"
                @click="handleClaimCoupon(coupon.id)"
              >
                {{ getCouponClaimButtonText(coupon) }}
              </button>
            </article>
          </div>
        </div>
      </section>
    </van-popup>

    <van-popup
      v-model:show="filterDrawerVisible"
      class="filter-drawer"
      position="right"
      teleport="body"
    >
      <section class="filter-drawer-panel">
        <header class="filter-drawer-head">
          <strong>商品筛选</strong>
          <button class="filter-drawer-close" type="button" aria-label="关闭筛选抽屉" @click="closeFilterDrawer">
            <van-icon name="cross" size="18" />
          </button>
        </header>

        <div class="filter-drawer-body">
          <section class="filter-section">
            <div class="filter-section-head">
              <strong>商品分类</strong>
            </div>

            <div class="category-chip-list">
              <button
                class="category-chip"
                :class="{ 'category-chip-active': selectedCategoryId === '' }"
                type="button"
                @click="handleCategorySelect('')"
              >
                全部分类
              </button>

              <button
                v-for="category in categoryOptions"
                :key="category.id"
                class="category-chip"
                :class="{ 'category-chip-active': selectedCategoryId === category.id }"
                type="button"
                @click="handleCategorySelect(category.id)"
              >
                {{ category.label }}
              </button>
            </div>
          </section>

          <section class="filter-section">
            <div class="filter-section-head">
              <strong>价格区间</strong>
            </div>

            <label class="price-field">
              <span>最低价</span>
              <input
                v-model="minPriceInput"
                inputmode="decimal"
                placeholder="0"
                type="number"
                @keyup.enter="applyDrawerFilter"
              >
            </label>

            <label class="price-field">
              <span>最高价</span>
              <input
                v-model="maxPriceInput"
                inputmode="decimal"
                placeholder="不限"
                type="number"
                @keyup.enter="applyDrawerFilter"
              >
            </label>
          </section>
        </div>

        <footer class="filter-drawer-actions">
          <button class="filter-action-button" type="button" @click="resetDrawerFilter">
            重置
          </button>
          <button class="filter-action-button filter-action-button-primary" type="button" @click="applyDrawerFilter">
            确认
          </button>
        </footer>
      </section>
    </van-popup>
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
  align-items: flex-start;
  padding: 16px 16px 6px;
}

.store-meta-grid {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  padding: 0 16px 16px;
}

.store-meta-item {
  flex: 1;
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.store-meta-item span {
  color: rgba(255, 233, 214, 0.8);
  font-size: 11px;
  font-weight: 600;
}

.store-meta-item strong {
  overflow: hidden;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.store-identity {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
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
  flex: 1;
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
  flex: 0 0 auto;
  display: inline-flex;
  align-self: flex-start;
  margin-left: auto;
  width: auto;
  min-width: 0;
  padding: 0;
  white-space: nowrap;
  font-weight: 600;
  --van-button-small-height: 30px;
  --van-button-small-padding: 0 10px;
  --van-button-default-border-color: rgba(255, 255, 255, 0.92);
  --van-button-default-color: #2b2521;
  --van-button-default-background: rgba(255, 255, 255, 0.92);
  --van-button-border-width: 1px;
  font-size: 12px;
}

.follow-button :deep(.van-button__content) {
  padding: 0 8px;
  white-space: nowrap;
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

.filter-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.sort-dropdown-shell {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  overflow: hidden;
}

.sort-dropdown :deep(.van-dropdown-menu) {
  box-shadow: none;
}

.sort-dropdown :deep(.van-dropdown-menu__bar) {
  height: 44px;
  border-radius: 16px;
  background: #faf8f5;
  box-shadow: none;
}

.sort-dropdown :deep(.van-dropdown-menu__item) {
  justify-content: flex-start;
}

.sort-dropdown :deep(.van-dropdown-menu__title) {
  color: #40372f;
  font-size: 13px;
  font-weight: 700;
}

.filter-trigger-button,
.filter-action-button,
.filter-drawer-close {
  border: 0;
  background: transparent;
}

.filter-trigger-button {
  flex: none;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 16px;
  background: #faf8f5;
  color: #52483f;
  font-size: 13px;
  font-weight: 700;
}

.filter-trigger-button-active {
  background: #fff1e5;
  color: #c25b0a;
}

.price-field {
  display: grid;
  gap: 6px;
}

.price-field span {
  color: #857f79;
  font-size: 12px;
  font-weight: 600;
}

.price-field input {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #e7dfd6;
  border-radius: 12px;
  background: #fff;
  color: #2f2a26;
  font-size: 13px;
}

.filter-action-button {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  background: #ece7e1;
  color: #6c655f;
  font-size: 12px;
  font-weight: 700;
}

.filter-action-button-primary {
  background: #f08a3e;
  color: #fff;
}

.filter-drawer {
  width: min(82vw, 320px);
  height: 100vh;
  height: 100dvh;
}

.filter-drawer-panel {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  background: #fff;
}

.filter-drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid #f0ebe5;
}

.filter-drawer-head strong {
  color: #2f2a26;
  font-size: 16px;
  font-weight: 700;
}

.filter-drawer-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: #867d75;
}

.filter-drawer-body {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 18px 16px;
}

.filter-section {
  display: grid;
  gap: 12px;
}

.filter-section-head strong {
  color: #2f2a26;
  font-size: 14px;
  font-weight: 700;
}

.category-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip {
  padding: 9px 14px;
  border: 1px solid #ece3d8;
  border-radius: 999px;
  background: #faf8f5;
  color: #62574d;
  font-size: 12px;
  font-weight: 600;
}

.category-chip-active {
  border-color: #f0b27b;
  background: #fff1e5;
  color: #c25b0a;
}

.filter-drawer-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 14px 16px calc(18px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #f0ebe5;
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

.section-head-spaced {
  justify-content: space-between;
}

.section-title-wrap {
  display: inline-flex;
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

.section-count {
  color: #8a847f;
  font-size: 12px;
  font-weight: 600;
}

.status-card {
  margin: 0;
  padding: 16px 0;
  background: transparent;
  color: #8a3b12;
  font-size: 14px;
  line-height: 1.6;
}

.status-card-inline {
  padding-top: 0;
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

.load-more-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  color: #8a847f;
  font-size: 12px;
  font-weight: 600;
}

.load-more-loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.load-more-trigger-finished {
  color: #b1aba5;
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

.coupon-popup {
  overflow: hidden;
}

.coupon-sheet {
  display: grid;
  gap: 16px;
  min-height: 260px;
  max-height: min(72vh, 620px);
  padding: 20px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  background:
    radial-gradient(circle at top left, rgba(240, 138, 62, 0.12), transparent 42%),
    linear-gradient(180deg, #fffaf3 0%, #fff 42%);
}

.coupon-sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.coupon-sheet-head strong {
  display: block;
  font-size: 18px;
  color: #2f2924;
}

.coupon-sheet-head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8d7868;
}

.coupon-sheet-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #8d7868;
}

.coupon-sheet-body {
  overflow-y: auto;
}

.coupon-list {
  display: grid;
  gap: 12px;
}

.coupon-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(240, 138, 62, 0.16);
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 238, 0.98));
  box-shadow: 0 10px 24px rgba(188, 119, 60, 0.08);
}

.coupon-card-main {
  min-width: 0;
}

.coupon-card-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(240, 138, 62, 0.12);
  font-size: 11px;
  color: #ba5f15;
}

.coupon-card-main strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
  line-height: 1.1;
  color: #c25b0a;
}

.coupon-card-main p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #47362c;
}

.coupon-card-meta {
  display: grid;
  gap: 4px;
  margin-top: 10px;
  font-size: 12px;
  color: #8a6f5b;
}

.coupon-claim-button {
  min-width: 92px;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #f08a3e, #cf6111);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.coupon-claim-button-disabled {
  background: #efe4db;
  color: #9f8877;
}

.coupon-card-skeleton {
  border-color: rgba(222, 214, 205, 0.7);
  background: #fff;
  box-shadow: none;
}

.coupon-skeleton-line,
.coupon-skeleton-button {
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(233, 227, 220, 0.72), rgba(244, 240, 235, 0.92));
}

.coupon-skeleton-line {
  height: 12px;
}

.coupon-skeleton-line-title {
  width: 44%;
  height: 22px;
  margin-top: 10px;
}

.coupon-skeleton-line-copy {
  width: 82%;
  margin-top: 10px;
}

.coupon-skeleton-button {
  width: 92px;
  height: 36px;
}

.coupon-empty {
  padding-top: 24px;
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
  .store-identity {
    align-items: flex-start;
  }

  .follow-button {
    width: auto;
  }

  .store-meta-grid {
    display: flex;
  }
}
</style>
