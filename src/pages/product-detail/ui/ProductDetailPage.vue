<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import { useCartStore } from '@/features/add-to-cart'
import { MemberFavoriteButton } from '@/features/toggle-member-favorite'
import { useModuleAvailability } from '@/shared/lib/modules'
import EmptyState from '@/shared/ui/EmptyState.vue'
import ImageCarousel from '@/shared/ui/ImageCarousel.vue'
import TopBarMoreMenuButton from '@/shared/ui/TopBarMoreMenuButton.vue'

import { useProductDetailPageModel } from '../model/useProductDetailPageModel'
import detailHeroImage from '../../../../design-ui/images/generated-1773915971397.png'

const props = defineProps<{
  productId: string
}>()

const router = useRouter()
const cartStore = useCartStore()
const isCartEnabled = useModuleAvailability('cart')
const { detailPage, errorMessage, isLoading, isNotFound, loadProductDetail, product } = useProductDetailPageModel(
  toRef(props, 'productId'),
)

const tabs = [
  { key: 'goods', label: '商品' },
  { key: 'detail', label: '详情' },
  { key: 'review', label: '评价' },
] as const

const activeTab = ref<(typeof tabs)[number]['key']>('goods')
const lastContentTab = ref<'goods' | 'detail'>('goods')
const reviewDrawerVisible = ref(false)
const specPopupVisible = ref(false)
const specPopupSource = ref<'buy' | 'cart' | 'spec'>('spec')
const scrollAreaRef = ref<HTMLElement | null>(null)
const goodsSectionRef = ref<HTMLElement | null>(null)
const detailSectionRef = ref<HTMLElement | null>(null)
const selectedSkuId = ref<string | null>(null)
const purchaseQuantity = ref(1)

const reviewFilters = [
  { key: 'all', label: '全部评价' },
  { key: 'good', label: '好评' },
  { key: 'middle', label: '中评' },
  { key: 'bad', label: '差评' },
  { key: 'photo', label: '订单晒图' },
] as const

const activeReviewFilter = ref<(typeof reviewFilters)[number]['key']>('all')

const detailPageData = computed(() => detailPage.value)

watch(
  detailPageData,
  (value) => {
    selectedSkuId.value = value?.selectedSkuId ?? value?.defaultSkuId ?? value?.skuList[0]?.skuId ?? null
    purchaseQuantity.value = Math.max(value?.quantity ?? 1, 1)
  },
  { immediate: true },
)

const currentSku = computed(() => {
  const currentDetail = detailPageData.value

  if (!currentDetail) {
    return null
  }

  return currentDetail.skuList.find((sku) => sku.skuId === selectedSkuId.value) ?? currentDetail.skuList[0] ?? null
})

const selectedText = computed(() => currentSku.value?.specText ?? '默认')
const popupStockText = computed(() => `库存：${currentSku.value?.stock ?? product.value?.inventory ?? 0}件`)
const currentUnitPrice = computed(() => currentSku.value?.price ?? product.value?.price ?? 0)
const currentStock = computed(() => currentSku.value?.stock ?? product.value?.inventory ?? 0)
const isCartPending = computed(() => (product.value ? cartStore.isProductPending(product.value.id) : false))
const isCurrentSelectionSoldOut = computed(() => currentStock.value <= 0)

const reviewRateText = computed(() => {
  const rate = detailPageData.value?.review.rate

  if (rate === null || rate === undefined) {
    return '好评率 100%'
  }

  return `好评率 ${Math.round(rate * 100)}%`
})

const reviewCountText = computed(() => `(${detailPageData.value?.review.count ?? 0}人评价)`)

const recommendProducts = computed(() => detailPageData.value?.recommendations ?? [])

const storeInfo = computed(() => detailPageData.value?.store ?? null)
const galleryItems = computed(() =>
  (product.value?.gallery.length ? product.value.gallery : [product.value?.coverImageUrl ?? null])
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
    .map((imageUrl) => ({
      imageUrl: resolveProductImage(imageUrl),
    })),
)

function resolveProductImage(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return detailHeroImage
  }

  return imageUrl
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

function goBack() {
  if (globalThis.window?.history.state?.back) {
    router.back()
    return
  }

  void router.push('/')
}

function getTargetScrollTop(target: HTMLElement, container: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()

  return Math.max(targetRect.top - containerRect.top + container.scrollTop - 16, 0)
}

function openReviewDrawer() {
  activeTab.value = 'review'
  reviewDrawerVisible.value = true
}

function closeReviewDrawer() {
  reviewDrawerVisible.value = false
  activeTab.value = lastContentTab.value
}

function openSpecPopup(source: 'buy' | 'cart' | 'spec') {
  specPopupSource.value = source
  specPopupVisible.value = true
}

function closeSpecPopup() {
  specPopupVisible.value = false
}

function selectSku(skuId: string) {
  selectedSkuId.value = skuId
}

function changePurchaseQuantity(delta: number) {
  const nextValue = purchaseQuantity.value + delta
  const maxQuantity = currentStock.value

  if (nextValue < 1) {
    return
  }

  if (maxQuantity > 0 && nextValue > maxQuantity) {
    purchaseQuantity.value = maxQuantity
    return
  }

  purchaseQuantity.value = nextValue
}

async function submitSpecAction(action: 'buy' | 'cart') {
  const actionText = action === 'buy' ? '立即购买' : '加入购物车'

  if (action === 'cart') {
    if (!isCartEnabled.value) {
      showFailToast('购物车功能暂未启用')
      return
    }

    if (!product.value) {
      showFailToast('商品信息加载中')
      return
    }

    if (isCurrentSelectionSoldOut.value) {
      showFailToast('当前规格暂时无货')
      return
    }

    try {
      const snapshot = await cartStore.addProduct(product.value, {
        quantity: purchaseQuantity.value,
        unitPrice: currentUnitPrice.value,
      })
      showSuccessToast(`已加入购物车，共 ${snapshot.itemCount} 件`)
      closeSpecPopup()
      return
    } catch {
      showFailToast(cartStore.errorMessage ?? '加入购物车失败')
      return
    }
  }

  showSuccessToast(`${actionText}：${selectedText.value} x${purchaseQuantity.value}`)
  closeSpecPopup()
}

function scrollToTab(tabKey: (typeof tabs)[number]['key']) {
  if (tabKey === 'review') {
    openReviewDrawer()
    return
  }

  if (reviewDrawerVisible.value) {
    reviewDrawerVisible.value = false
  }

  lastContentTab.value = tabKey
  activeTab.value = tabKey

  const targetMap = {
    detail: detailSectionRef.value,
    goods: goodsSectionRef.value,
  } as const

  const target = targetMap[tabKey]

  if (!target || !scrollAreaRef.value) {
    return
  }

  scrollAreaRef.value.scrollTo({
    top: getTargetScrollTop(target, scrollAreaRef.value),
    behavior: 'smooth',
  })
}
</script>

<template>
  <section class="product-detail-page">
    <header class="top-bar">
      <button class="icon-button" type="button" aria-label="返回上一页" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>

      <div class="tab-wrap" role="tablist" aria-label="详情页内容切换">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-button"
          :class="{ 'tab-button-active': activeTab === tab.key }"
          type="button"
          @click="scrollToTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <TopBarMoreMenuButton aria-label="更多操作" />
    </header>

    <p v-if="isLoading" class="state-card">正在加载商品详情...</p>

    <div v-else-if="errorMessage" class="state-card error-state">
      <p>{{ errorMessage }}</p>
      <van-button round type="primary" size="small" @click="loadProductDetail">重新加载</van-button>
    </div>

    <div v-else-if="isNotFound" class="state-card">
      <p>未找到对应商品。</p>
      <RouterLink class="state-link" to="/">返回商城首页</RouterLink>
    </div>

    <template v-else-if="product">
      <div ref="scrollAreaRef" class="detail-scroll">
        <section ref="goodsSectionRef" class="hero-wrap">
          <div class="hero-image-box">
            <ImageCarousel
              height="286px"
              :autoplay="0"
              :items="galleryItems"
              variant="gallery"
            />

            <MemberFavoriteButton
              class="favorite-button"
              :product-id="product.id"
              :product-image-url="product.coverImageUrl"
              :product-name="product.name"
              :product-price="product.price"
              :store-name="storeInfo?.storeName ?? '默认店铺'"
            />
          </div>
        </section>

        <div class="detail-content">
          <section class="summary-block">
            <h1>{{ product.name }}</h1>
            <p class="subtitle">{{ product.summary }}</p>
            <div class="price-row">
              <span class="price-value">¥{{ formatAmount(product.price) }}</span>
            </div>
          </section>

          <button class="info-row" type="button" @click="openSpecPopup('spec')">
            <span class="info-label">已选</span>
            <span class="info-value">{{ selectedText }}</span>
            <van-icon name="arrow" size="16" />
          </button>

          <button class="info-row" type="button" @click="openReviewDrawer">
            <div class="review-left">
              <span class="review-label">商品评价</span>
              <strong>{{ reviewRateText }}</strong>
            </div>

            <div class="review-right">
              <span>{{ reviewCountText }}</span>
              <van-icon name="arrow" size="16" />
            </div>
          </button>

          <section class="merchant-card">
            <button class="merchant-head" type="button">
              <strong>商家信息</strong>
              <van-icon name="arrow" size="16" />
            </button>

            <div class="merchant-store">
              <van-icon name="shop-o" size="18" />
              <span>{{ storeInfo?.storeName ?? '品牌旗舰店' }}</span>
            </div>

            <div class="metric-row">
              <div class="metric-item">
                <span>描述相符</span>
                <strong>{{ Math.round(storeInfo?.score.descriptionScore ?? 5) }} 高</strong>
              </div>
              <div class="metric-item">
                <span>服务态度</span>
                <strong>{{ Math.round(storeInfo?.score.serviceScore ?? 5) }} 高</strong>
              </div>
              <div class="metric-item">
                <span>发货速度</span>
                <strong>{{ Math.round(storeInfo?.score.deliveryScore ?? 5) }} 高</strong>
              </div>
            </div>
          </section>

          <section class="recommend-section">
            <h2>店铺推荐</h2>

            <div class="recommend-grid">
              <RouterLink
                v-for="(item, index) in recommendProducts"
                :key="`${item.id}-${index}`"
                class="recommend-card"
                :to="{ name: 'product-detail', params: { productId: item.id } }"
              >
                <img :src="resolveProductImage(item.imageUrl)" :alt="item.name">
                <strong>{{ item.name }}</strong>
                <span>¥{{ formatAmount(item.price) }}</span>
              </RouterLink>
            </div>
          </section>

          <section ref="detailSectionRef" class="detail-panel">
            <button class="detail-trigger" type="button" @click="scrollToTab('detail')">
              点击查看商品详情
            </button>

            <div class="detail-copy">
              <p>{{ product.detailDescription }}</p>
            </div>

            <dl class="attribute-list">
              <template v-for="attribute in product.attributes" :key="attribute.label">
                <dt>{{ attribute.label }}</dt>
                <dd>{{ attribute.value }}</dd>
              </template>
            </dl>
          </section>
        </div>
      </div>

      <footer class="action-bar">
        <button class="tool-button" type="button">
          <van-icon name="service-o" size="18" />
          <span>客服</span>
        </button>

        <RouterLink class="tool-button" to="/cart">
          <van-icon name="shopping-cart-o" size="18" />
          <span>购物车</span>
        </RouterLink>

        <button class="action-button action-button-light" type="button" @click="openSpecPopup('buy')">立即购买</button>
        <button
          class="action-button action-button-primary"
          type="button"
          :disabled="!isCartEnabled"
          @click="openSpecPopup('cart')"
        >
          加入购物车
        </button>
      </footer>

      <van-popup
        v-model:show="reviewDrawerVisible"
        class="review-drawer"
        position="right"
        teleport="body"
        :overlay-style="{ background: 'rgba(17, 17, 17, 0.42)' }"
        :style="{ width: '100vw', height: '100dvh' }"
        @closed="activeTab = lastContentTab"
      >
        <section class="review-drawer-body">
          <header class="top-bar review-drawer-top-bar">
            <button class="icon-button" type="button" aria-label="关闭评价抽屉" @click="closeReviewDrawer">
              <van-icon name="arrow-left" size="20" />
            </button>

            <div class="tab-wrap" role="tablist" aria-label="评价抽屉内容切换">
              <button
                v-for="tab in tabs"
                :key="`drawer-${tab.key}`"
                class="tab-button"
                :class="{ 'tab-button-active': activeTab === tab.key }"
                type="button"
                @click="scrollToTab(tab.key)"
              >
                {{ tab.label }}
              </button>
            </div>

            <TopBarMoreMenuButton aria-label="更多操作" />
          </header>

          <div class="review-drawer-content">
            <div class="review-chip-row">
              <button
                v-for="filter in reviewFilters"
                :key="filter.key"
                class="review-chip"
                :class="{ 'review-chip-active': activeReviewFilter === filter.key }"
                type="button"
                @click="activeReviewFilter = filter.key"
              >
                {{ filter.label }}
              </button>
            </div>

            <EmptyState
              class="review-empty-state"
              description="全部评价将以抽屉形式在这里展示"
              icon="comment-circle-o"
              size="compact"
              title="暂时还没有评价内容"
            />
          </div>
        </section>
      </van-popup>

      <div v-if="specPopupVisible" class="spec-popup-hint">
        <van-icon name="replay" size="14" />
        <span>点击此处返回</span>
      </div>

      <van-popup
        v-model:show="specPopupVisible"
        class="spec-popup"
        position="bottom"
        teleport="body"
        :overlay-style="{ background: 'rgba(0, 0, 0, 0.45)' }"
      >
        <div class="spec-popup-content">
          <section class="spec-sheet">
            <button class="spec-close-button" type="button" aria-label="关闭规格弹窗" @click="closeSpecPopup">
              <van-icon name="cross" size="18" />
            </button>

            <div class="spec-sheet-header">
              <div class="spec-image-box">
                <img :src="resolveProductImage(product.gallery[0] ?? product.coverImageUrl)" :alt="product.name">
              </div>

              <div class="spec-meta">
                <strong>{{ product.name }}</strong>
                <span class="spec-price">¥{{ formatAmount(currentSku?.price ?? product.price) }}</span>
                <span class="spec-stock">{{ popupStockText }}</span>
              </div>
            </div>

            <div class="spec-divider" />

            <section class="spec-section">
              <span class="spec-section-label">选择规格</span>

              <div class="spec-tag-row">
                <button
                  v-for="sku in detailPageData?.skuList ?? []"
                  :key="sku.skuId"
                  class="spec-tag"
                  :class="{ 'spec-tag-active': currentSku?.skuId === sku.skuId }"
                  type="button"
                  @click="selectSku(sku.skuId)"
                >
                  {{ sku.specText }}
                </button>
              </div>
            </section>

            <div class="qty-row">
              <span class="qty-label">购买数量</span>

              <div class="qty-stepper">
                <button class="qty-button" type="button" aria-label="减少购买数量" @click="changePurchaseQuantity(-1)">
                  -
                </button>
                <span class="qty-value">{{ purchaseQuantity }}</span>
                <button class="qty-button qty-button-plus" type="button" aria-label="增加购买数量" @click="changePurchaseQuantity(1)">
                  +
                </button>
              </div>
            </div>
          </section>

          <footer class="action-bar spec-action-bar">
            <button class="tool-button" type="button">
              <van-icon name="service-o" size="18" />
              <span>客服</span>
            </button>

            <RouterLink class="tool-button" to="/cart">
              <van-icon name="shopping-cart-o" size="18" />
              <span>购物车</span>
            </RouterLink>

            <button class="action-button action-button-light" type="button" @click="submitSpecAction('buy')">立即购买</button>
            <button
              class="action-button action-button-primary"
              type="button"
              :disabled="!isCartEnabled || isCartPending || isCurrentSelectionSoldOut"
              @click="submitSpecAction('cart')"
            >
              加入购物车
            </button>
          </footer>
        </div>
      </van-popup>
    </template>
  </section>
</template>

<style scoped>
.product-detail-page {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100vh;
  height: 100dvh;
  background: #fff;
  overflow: hidden;
}

.top-bar {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 24px;
  gap: 16px;
  align-items: center;
  min-height: 56px;
  padding: 12px 16px;
  border-bottom: 1px solid #eeeae5;
  background: #fff;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #9c9b99;
}

.tab-wrap {
  display: flex;
  justify-content: center;
  gap: 28px;
  min-width: 0;
}

.tab-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #3c3b39;
  font-size: 15px;
  font-weight: 500;
}

.tab-button-active {
  color: #ea580c;
  font-weight: 700;
}

.detail-scroll {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  scrollbar-width: none;
}

.detail-scroll::-webkit-scrollbar {
  display: none;
}

.hero-wrap {
  display: grid;
}

.hero-image-box {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 286px;
  overflow: hidden;
}

.favorite-button {
  position: absolute;
  right: 16px;
  bottom: 12px;
}

.detail-content {
  display: grid;
  gap: 16px;
  padding: 16px 20px 24px;
}

.summary-block,
.merchant-card,
.detail-panel {
  display: grid;
  gap: 12px;
}

.summary-block h1 {
  margin: 0;
  color: #1a1918;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.subtitle,
.detail-copy p {
  margin: 0;
  color: #78716c;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
}

.price-row {
  display: flex;
  align-items: center;
}

.price-value {
  color: #ea580c;
  font-size: 30px;
  font-weight: 600;
}

.info-row,
.merchant-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 50px;
  padding: 14px 16px;
  border: 1px solid #eeeae5;
  border-radius: 14px;
  background: #fff;
  color: #6d6c6a;
  text-align: left;
}

.info-label,
.info-value,
.review-label,
.review-right span {
  font-size: 14px;
  font-weight: 500;
}

.review-left,
.review-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.review-left strong {
  color: #ea580c;
  font-size: 14px;
  font-weight: 700;
}

.merchant-card {
  padding: 16px;
  border: 1px solid #eeeae5;
  border-radius: 18px;
  background: #fff;
}

.merchant-head {
  min-height: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
}

.merchant-head strong {
  color: #3c3b39;
  font-size: 16px;
  font-weight: 700;
}

.merchant-store {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #1a1918;
  font-size: 15px;
  font-weight: 600;
}

.merchant-store :deep(.van-icon) {
  color: #6d6c6a;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  gap: 4px;
  align-items: center;
  color: #a8a29e;
  font-size: 12px;
  font-weight: 500;
}

.metric-item strong {
  color: #ea580c;
  font-weight: 700;
}

.recommend-section {
  display: grid;
  gap: 12px;
}

.recommend-section h2 {
  margin: 0;
  color: #3c3b39;
  font-size: 16px;
  font-weight: 700;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 12px;
}

.recommend-card {
  display: grid;
  gap: 8px;
  color: inherit;
}

.recommend-card img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  object-fit: cover;
  background: #f7f2eb;
}

.recommend-card strong {
  display: -webkit-box;
  overflow: hidden;
  min-height: 32px;
  color: #4b4a48;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.recommend-card span {
  color: #6d6c6a;
  font-size: 12px;
  font-weight: 500;
}

.detail-panel {
  padding-bottom: 8px;
}

.detail-trigger {
  padding: 0;
  border: 0;
  background: transparent;
  color: #9c9b99;
  font-size: 14px;
  font-weight: 600;
}

.detail-copy,
.attribute-list {
  padding: 16px;
  border-radius: 16px;
  background: #fafaf8;
}

.attribute-list {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 10px 12px;
  margin: 0;
}

.attribute-list dt {
  color: #9c9b99;
}

.attribute-list dd {
  margin: 0;
  color: #3c3b39;
  font-weight: 600;
}

.action-bar {
  display: grid;
  grid-template-columns: 40px 40px minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 82px;
  padding: 12px 12px calc(20px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #eeeae5;
  background: #fff;
}

.review-drawer {
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  border-radius: 0;
  overflow: hidden;
  background: #fff;
}

.spec-popup {
  overflow: visible;
  background: transparent;
}

.spec-popup-content {
  display: grid;
  gap: 0;
}

.spec-popup-hint {
  position: fixed;
  left: 50%;
  top: 43%;
  z-index: 2001;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.8);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transform: translateX(-50%);
  pointer-events: none;
}

.spec-sheet {
  position: relative;
  display: grid;
  gap: 18px;
  padding: 18px 16px 20px;
  border-radius: 24px 24px 0 0;
  background: #fff;
}

.spec-close-button {
  position: absolute;
  top: -18px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d6d3d1;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #9c9b99;
}

.spec-sheet-header {
  display: flex;
  gap: 14px;
}

.spec-image-box {
  flex: none;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border-radius: 12px;
  background: #f7f2eb;
}

.spec-image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spec-meta {
  display: grid;
  flex: 1;
  gap: 8px;
  align-content: start;
  min-width: 0;
  padding-top: 2px;
}

.spec-meta strong {
  color: #1a1918;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
}

.spec-price {
  color: #ea580c;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.spec-stock {
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
}

.spec-divider {
  height: 1px;
  background: #f0eeea;
}

.spec-section {
  display: grid;
  gap: 12px;
}

.spec-section-label,
.qty-label {
  color: #6d6c6a;
  font-size: 15px;
  font-weight: 500;
}

.spec-tag-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.spec-tag {
  padding: 10px 14px;
  border: 0;
  border-radius: 12px;
  background: #f5f5f4;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 600;
}

.spec-tag-active {
  border: 1px solid #fdba74;
  background: #ffedd5;
  color: #ea580c;
  font-weight: 700;
}

.qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.qty-stepper {
  display: inline-flex;
  gap: 18px;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e5e4e1;
  border-radius: 10px;
  background: #fff;
}

.qty-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #9c9b99;
  font-size: 22px;
  font-weight: 500;
  line-height: 1;
}

.qty-button-plus,
.qty-value {
  color: #6d6c6a;
}

.qty-value {
  min-width: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.spec-action-bar {
  background: #fff;
}

.review-drawer-body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: #fff;
}

.review-drawer-top-bar {
  border-bottom: 1px solid #eeeae5;
}

.review-drawer-content {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 20px;
  min-height: 0;
  padding: 16px 20px 20px;
  background: #fff;
}

.review-chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.review-chip {
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6d6c6a;
  font-size: 12px;
  font-weight: 600;
}

.review-chip-active {
  background: #ffedd5;
  color: #ea580c;
  font-weight: 700;
}

.review-empty-state {
  align-content: center;
  min-height: 0;
}

.tool-button {
  display: grid;
  gap: 4px;
  justify-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #6d6c6a;
  font-size: 11px;
  font-weight: 500;
}

.action-button {
  height: 46px;
  border: 0;
  border-radius: 30px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
}

.action-button-light {
  background: #fb923c;
}

.action-button-primary {
  background: #ea580c;
}

.state-card {
  display: grid;
  gap: 12px;
  align-content: start;
  margin: 20px;
  padding: 18px;
  border-radius: 18px;
  background: #faf6f0;
  color: #78716c;
}

.state-card p {
  margin: 0;
}

.error-state {
  color: #c2410c;
}

.state-link {
  color: #ea580c;
  font-weight: 600;
}
</style>
