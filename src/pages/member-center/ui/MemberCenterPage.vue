<script setup lang="ts">
import { computed, onActivated, onMounted, onUnmounted, watch } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { showLoadingToast, showToast, type ToastWrapperInstance } from 'vant'

import { MemberLogoutButton } from '@/features/member-logout'
import { useBackendRuntime } from '@/app/providers/backend'
import { backendTarget } from '@/shared/config/backend'
import { readAppVersion } from '@/shared/lib/app-version'
import { useModuleAvailability } from '@/shared/lib/modules'
import { isWechatBrowser, startWechatOauthLogin } from '@/shared/lib/wechat-browser'

import { useMemberCenterPageModel } from '../model/useMemberCenterPageModel'

const router = useRouter()
const runtime = useBackendRuntime()
const {
  errorMessage,
  hasLoadedOnce,
  isLoading,
  loadMemberCenterPage,
  memberCenterPageData,
} = useMemberCenterPageModel()
const isCartEnabled = useModuleAvailability('cart')
const isCouponEnabled = computed(() => runtime.capabilities.coupon)
const canShowWechatLogout = computed(() => runtime.capabilities.wechatLogout)
const isReviewEnabled = useModuleAvailability('review')
const appVersionText = `版本号：${readAppVersion()}`
const isLoggedIn = computed(() => memberCenterPageData.value.profile.isLoggedIn)
const shouldShowLogoutButton = computed(() => !isWechatBrowser() || canShowWechatLogout.value)
const shouldShowInitialError = computed(() => !isLoading.value && !hasLoadedOnce.value && Boolean(errorMessage.value))
const loginEntryRoute = computed<RouteLocationRaw>(() => ({
  name: 'member-login',
  query: { redirect: '/member' },
}))
let loadingToast: ToastWrapperInstance | null = null

type OrderListFilterStatus =
  | 'all'
  | 'pending-payment'
  | 'pending-shipment'
  | 'pending-receipt'
  | 'pending-review'
  | 'after-sale'

interface CountCard {
  label: string
  route: RouteLocationRaw
  value: number
}

interface OrderEntry {
  count: number
  icon: string
  key: string
  label: string
  route: RouteLocationRaw
}

const countCards = computed<CountCard[]>(() => {
  const cards: CountCard[] = []

  if (isCouponEnabled.value) {
    cards.push({
      label: '优惠券',
      route: { name: 'member-coupons' },
      value: memberCenterPageData.value.counts.couponCount,
    })
  }

  cards.push(
    { label: '收藏夹', route: { name: 'member-favorites' }, value: memberCenterPageData.value.counts.favoritesCount },
    { label: '足迹', route: { name: 'member-history' }, value: memberCenterPageData.value.counts.browsingCount },
  )

  if (isCartEnabled.value) {
    cards.splice(2, 0, {
      label: '购物车',
      route: { name: 'cart' },
      value: memberCenterPageData.value.counts.cartCount,
    })
  }

  return cards
})

const orderEntries = computed<OrderEntry[]>(() => [
  {
    count: memberCenterPageData.value.orderSummary.pendingPaymentCount,
    key: 'pendingPaymentCount',
    label: '待付款',
    icon: 'balance-o',
    route: buildOrderRoute('pending-payment'),
  },
  {
    count: memberCenterPageData.value.orderSummary.pendingShipmentCount,
    key: 'pendingShipmentCount',
    label: '待发货',
    icon: 'logistics',
    route: buildOrderRoute('pending-shipment'),
  },
  {
    count: memberCenterPageData.value.orderSummary.pendingReceiptCount,
    key: 'pendingReceiptCount',
    label: '待收货',
    icon: 'send-gift-o',
    route: buildOrderRoute('pending-receipt'),
  },
  ...(isReviewEnabled.value
    ? [{
        count: memberCenterPageData.value.orderSummary.pendingReviewCount,
        key: 'pendingReviewCount',
        label: '待评价',
        icon: 'chat-o',
        route: buildOrderRoute('pending-review'),
      } satisfies OrderEntry]
    : []),
  {
    count: backendTarget === 'backend-a' ? 0 : memberCenterPageData.value.orderSummary.refundAndReturnCount,
    key: 'refundAndReturnCount',
    label: '退款/退货',
    icon: 'replay',
    route: buildOrderRoute('after-sale'),
  },
] as const)

const shortcutIcons = {
  balance: 'cash-back-record',
  cards: 'coupon-o',
  'payment-code': 'qr-invalid',
  settings: 'setting-o',
} as const

function resolveShortcutIcon(shortcutKey: string) {
  return shortcutIcons[shortcutKey as keyof typeof shortcutIcons] ?? 'apps-o'
}

function buildOrderRoute(status: OrderListFilterStatus = 'all'): RouteLocationRaw {
  return {
    name: 'member-orders',
    query: status === 'all' ? undefined : { status },
  }
}

function goToShortcut(shortcutKey: string) {
  if (shortcutKey === 'cards') {
    return { name: 'member-cards' }
  }

  return undefined
}

function handleLoggedOut() {
  void loadMemberCenterPage()
}

async function handleLoginEntry() {
  if (isWechatBrowser()) {
    const result = await startWechatOauthLogin('/member')

    if (result.succeeded) {
      await loadMemberCenterPage()
      return
    }

    if (result.message) {
      showToast(result.message)
    }

    return
  }

  await router.push(loginEntryRoute.value)
}

onMounted(() => {
  void loadMemberCenterPage()
})

onActivated(() => {
  void loadMemberCenterPage()
})

function retryLoadMemberCenterPage() {
  void loadMemberCenterPage()
}

function openCustomerService() {
  void router.push({ name: 'member-customer-service' })
}

function closeLoadingToast() {
  loadingToast?.close()
  loadingToast = null
}

watch([isLoading, hasLoadedOnce], ([loading, loadedOnce]) => {
  if (loading && !loadedOnce) {
    if (loadingToast) {
      return
    }

    loadingToast = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: '正在加载...',
    })
    return
  }

  closeLoadingToast()
}, { immediate: true })

onUnmounted(() => {
  closeLoadingToast()
})
</script>

<template>
  <section class="member-page">
    <div v-if="shouldShowInitialError" class="page-state">
      <p class="status-text">{{ errorMessage }}</p>
      <button class="retry-button" type="button" @click="retryLoadMemberCenterPage">
        重新加载
      </button>
    </div>

    <div v-else class="member-scroll">
      <section class="top-section">
        <div class="top-background">
          <button
            v-if="!memberCenterPageData.profile.isLoggedIn"
            class="profile-area profile-link"
            type="button"
            @click="handleLoginEntry"
          >
            <div class="avatar">
              <img
                v-if="memberCenterPageData.profile.avatarUrl"
                :src="memberCenterPageData.profile.avatarUrl"
                :alt="memberCenterPageData.profile.username ?? '用户头像'"
              >
              <van-icon v-else name="contact" size="32" />
            </div>

            <div class="text-area">
              <strong>{{ memberCenterPageData.profile.username ?? '点击登录/注册' }}</strong>
              <span>{{ memberCenterPageData.profile.isLoggedIn ? '欢迎回来' : '可查看更多信息' }}</span>
            </div>
          </button>

          <div v-else class="profile-area">
            <div class="avatar">
              <img
                v-if="memberCenterPageData.profile.avatarUrl"
                :src="memberCenterPageData.profile.avatarUrl"
                :alt="memberCenterPageData.profile.username ?? '用户头像'"
              >
              <van-icon v-else name="contact" size="32" />
            </div>

            <div class="text-area">
              <strong>{{ memberCenterPageData.profile.username ?? '点击登录/注册' }}</strong>
              <span>{{ memberCenterPageData.profile.isLoggedIn ? '欢迎回来' : '可查看更多信息' }}</span>
            </div>

            <MemberLogoutButton
              v-if="shouldShowLogoutButton"
              class="logout-action"
              @logged-out="handleLoggedOut"
            />
          </div>
        </div>
        
        <div
          v-if="isLoggedIn"
          class="count-row"
          :style="{ gridTemplateColumns: `repeat(${countCards.length}, minmax(0, 1fr))` }"
        >
          <RouterLink
            v-for="card in countCards"
            :key="card.label"
            class="count-card"
            :to="card.route"
          >
            <strong>{{ card.value }}</strong>
            <span>{{ card.label }}</span>
          </RouterLink>
        </div>
      </section>

      <div class="content-wrapper">
        <section v-if="isLoggedIn" class="order-card">
          <header class="section-head">
            <strong>我的订单</strong>
            <RouterLink class="head-action" :to="buildOrderRoute()">
              <span>查看全部</span>
              <van-icon name="arrow" size="14" />
            </RouterLink>
          </header>

          <div class="order-grid">
            <RouterLink
              v-for="entry in orderEntries"
              :key="entry.key"
              class="order-entry"
              :to="entry.route"
            >
              <van-badge
                :content="entry.count > 0 ? entry.count : undefined"
                :max="99"
                class="order-entry-badge"
              >
                <van-icon :name="entry.icon" size="22" />
              </van-badge>
              <span class="order-entry-label">{{ entry.label }}</span>
            </RouterLink>
          </div>
        </section>

        <section v-if="isLoggedIn" class="shortcut-card">
          <div class="shortcut-row">
            <RouterLink
              v-for="shortcut in memberCenterPageData.shortcuts.slice(0, 2)"
              :key="shortcut.key"
              class="shortcut-entry"
              :to="goToShortcut(shortcut.key) ?? shortcut.route"
            >
              <van-icon :name="resolveShortcutIcon(shortcut.key)" size="22" />
              <span>{{ shortcut.label }}</span>
            </RouterLink>
          </div>

          <div class="shortcut-row shortcut-row-bordered">
            <RouterLink
              v-for="shortcut in memberCenterPageData.shortcuts.slice(2, 4)"
              :key="shortcut.key"
              class="shortcut-entry"
              :to="goToShortcut(shortcut.key) ?? shortcut.route"
            >
              <van-icon :name="resolveShortcutIcon(shortcut.key)" size="22" />
              <span>{{ shortcut.label }}</span>
            </RouterLink>
          </div>
        </section>

        <section v-if="isLoggedIn" class="service-card">
          <RouterLink class="service-entry" :to="{ name: 'member-addresses' }">
            <div class="service-copy">
              <div class="service-icon">
                <van-icon name="location-o" size="18" />
              </div>

              <div class="service-text">
                <strong>地址管理</strong>
                <span>新增、编辑、删除常用收货地址</span>
              </div>
            </div>

            <van-icon class="service-arrow" name="arrow" size="16" />
          </RouterLink>
        </section>

        <section class="tip-block">
          <p class="tip-text">{{ appVersionText }}</p>
          <p v-if="memberCenterPageData.servicePhone" class="service-phone">
            客服电话：{{ memberCenterPageData.servicePhone }}
          </p>
          <button class="contact-button" type="button" @click="openCustomerService">
            联系我们
          </button>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.member-page {
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.member-scroll {
  display: grid;
  grid-template-rows: auto auto;
  gap: 20px;
  height: 100%;
  padding: 0 0 96px;
  overflow-y: auto;
  align-items: start;
  scrollbar-width: none;
}

.member-scroll::-webkit-scrollbar {
  display: none;
}

.page-state {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 14px;
  height: 100%;
  padding: 24px;
  text-align: center;
}

.status-text {
  margin: 0;
  color: #6b645d;
  font-size: 14px;
  line-height: 1.6;
}

.retry-button {
  min-width: 120px;
  min-height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: #44a08d;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.top-section {
  display: grid;
  gap: 20px;
  align-items: center;
}

.top-background {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-height: 180px;
  background: linear-gradient(180deg, #44a08d 0%, #4ecdc4 30%, #fafaf8 100%);
}

.profile-area {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  width: min(100%, 362px);
  padding: 32px 20px 18px;
  margin: 0 auto;
}

.profile-link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  border: 0;
  background: transparent;
  color: inherit;
  text-decoration: none;
  text-align: left;
}

.logout-action {
  justify-self: end;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border-radius: 50%;
  background: #fff;
  color: #44a08d;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-area {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.text-area strong {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}

.text-area span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}

.count-row {
  display: grid;
  gap: 12px;
  width: min(calc(100% - 32px), 362px);
  margin: 0 auto;
}

.count-card {
  display: grid;
  gap: 6px;
  justify-items: center;
  padding: 18px 12px;
  border: 1px solid #ece8e3;
  border-radius: 16px;
  background: #fff;
  color: inherit;
  text-decoration: none;
}

.count-card strong {
  color: #1a1918;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.count-card span {
  color: #9c9b99;
  font-size: 11px;
  font-weight: 500;
}

.content-wrapper {
  display: grid;
  gap: 20px;
  width: min(calc(100% - 32px), 362px);
  margin: 0 auto;
}

.order-card,
.shortcut-card,
.service-card {
  overflow: hidden;
  border: 1px solid #e5e4e1;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(26, 25, 24, 0.03);
}

.order-card {
  display: grid;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
}

.section-head strong {
  color: #1a1918;
  font-size: 16px;
  font-weight: 600;
}

.head-action {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  border: 0;
  background: transparent;
  color: #9c9b99;
  font-size: 12px;
  font-weight: 500;
}

.order-grid {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 8px;
  padding: 8px 12px 16px;
}

.order-entry {
  display: grid;
  gap: 6px;
  flex: 0 1 72px;
  justify-items: center;
  padding: 10px 4px;
  border: 0;
  background: transparent;
  color: #3d8a5a;
}

.order-entry-badge {
  display: inline-flex;
}

.order-entry-badge :deep(.van-badge__wrapper) {
  display: inline-flex;
}

.order-entry-badge :deep(.van-badge__content) {
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

.order-entry-label {
  color: #3c3b39;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
}

.shortcut-card {
  display: grid;
}

.shortcut-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.shortcut-row-bordered {
  border-top: 1px solid #e5e4e1;
}

.shortcut-entry {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 16px 14px;
  border: 0;
  background: #fff;
  color: #1a1918;
  font-size: 15px;
  font-weight: 600;
}

.shortcut-entry + .shortcut-entry {
  border-left: 1px solid #e5e4e1;
}

.shortcut-entry :deep(.van-icon) {
  color: #3d8a5a;
}

.service-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  color: inherit;
  text-decoration: none;
}

.service-copy {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.service-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(61, 138, 90, 0.12);
  color: #3d8a5a;
}

.service-text {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.service-text strong {
  color: #1a1918;
  font-size: 15px;
  font-weight: 600;
}

.service-text span {
  color: #9c9b99;
  font-size: 12px;
  line-height: 1.4;
}

.service-arrow {
  color: #b4b2ad;
}

.tip-block {
  display: grid;
  gap: 12px;
  padding: 8px 12px;
}

.tip-text,
.service-phone {
  margin: 0;
  text-align: center;
}

.tip-text {
  color: #d89575;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.4;
}

.service-phone {
  color: #9c9b99;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.3;
  white-space: pre-line;
}

.contact-button {
  justify-self: center;
  min-width: 132px;
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: #44a08d;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
</style>
