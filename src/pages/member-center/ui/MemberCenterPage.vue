<script setup lang="ts">
import { useRouter } from 'vue-router'

import { mockAccountData } from '@/shared/mocks'

const memberCenterPageData = mockAccountData.memberCenterPageData
const router = useRouter()

const countCards = [
  { label: '收藏夹', value: memberCenterPageData.counts.favoritesCount },
  { label: '购物车', value: memberCenterPageData.counts.cartCount },
  { label: '足迹', value: memberCenterPageData.counts.browsingCount },
] as const

const orderEntries = [
  { key: 'pendingPaymentCount', label: '待付款', icon: 'balance-o', status: 'pending-payment' },
  { key: 'pendingShipmentCount', label: '待发货', icon: 'logistics', status: 'pending-shipment' },
  { key: 'pendingReceiptCount', label: '待收货', icon: 'send-gift-o', status: 'pending-receipt' },
  { key: 'pendingReviewCount', label: '待评价', icon: 'chat-o', status: 'pending-review' },
  { key: 'refundAndReturnCount', label: '退款/退货', icon: 'replay', status: 'all' },
] as const

const shortcutIcons = {
  balance: 'cash-back-record',
  cards: 'coupon-o',
  'payment-code': 'qr-invalid',
  settings: 'setting-o',
} as const

function goToOrders(status = 'all') {
  void router.push({
    name: 'member-orders',
    query: status === 'all' ? undefined : { status },
  })
}

function goToShortcut(shortcutKey: string) {
  if (shortcutKey === 'cards') {
    void router.push({ name: 'member-cards' })
  }
}
</script>

<template>
  <section class="member-page">
    <div class="member-scroll">
      <section class="top-section">
        <div class="top-background">
          <div class="profile-area">
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
              <span>{{ memberCenterPageData.profile.isLoggedIn ? '欢迎回来，查看完整账户信息' : '可查看更多信息' }}</span>
            </div>
          </div>
        </div>

        <div class="count-row">
          <article v-for="card in countCards" :key="card.label" class="count-card">
            <strong>{{ card.value }}</strong>
            <span>{{ card.label }}</span>
          </article>
        </div>
      </section>

      <div class="content-wrapper">
        <section class="order-card">
          <header class="section-head">
            <strong>我的订单</strong>
            <button class="head-action" type="button" @click="goToOrders()">
              <span>查看全部</span>
              <van-icon name="arrow" size="14" />
            </button>
          </header>

          <div class="order-grid">
            <button
              v-for="entry in orderEntries"
              :key="entry.key"
              class="order-entry"
              type="button"
              @click="goToOrders(entry.status)"
            >
              <van-icon :name="entry.icon" size="22" />
              <span>{{ entry.label }}</span>
            </button>
          </div>
        </section>

        <section class="shortcut-card">
          <div class="shortcut-row">
            <button
              v-for="shortcut in memberCenterPageData.shortcuts.slice(0, 2)"
              :key="shortcut.key"
              class="shortcut-entry"
              type="button"
              @click="goToShortcut(shortcut.key)"
            >
              <van-icon :name="shortcutIcons[shortcut.key]" size="22" />
              <span>{{ shortcut.label }}</span>
            </button>
          </div>

          <div class="shortcut-row shortcut-row-bordered">
            <button
              v-for="shortcut in memberCenterPageData.shortcuts.slice(2, 4)"
              :key="shortcut.key"
              class="shortcut-entry"
              type="button"
            >
              <van-icon :name="shortcutIcons[shortcut.key]" size="22" />
              <span>{{ shortcut.label }}</span>
            </button>
          </div>
        </section>

        <section class="tip-block">
          <p class="tip-text">{{ memberCenterPageData.tipText }}</p>
          <p class="service-phone">客服电话：{{ memberCenterPageData.servicePhone }}</p>
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

.top-section {
  display: grid;
  gap: 20px;
  align-items: center;
}

.top-background {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 180px;
  background: linear-gradient(180deg, #44a08d 0%, #4ecdc4 30%, #fafaf8 100%);
}

.profile-area {
  display: flex;
  gap: 16px;
  align-items: center;
  width: min(100%, 362px);
  padding: 32px 20px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
.shortcut-card {
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
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  padding: 8px 12px 16px;
}

.order-entry {
  display: grid;
  gap: 6px;
  justify-items: center;
  padding: 10px 4px;
  border: 0;
  background: transparent;
  color: #3d8a5a;
}

.order-entry span {
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
</style>
