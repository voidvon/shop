<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import type { MemberCouponListItem } from '@/processes/member-center'
import CouponCard from '@/shared/ui/CouponCard.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { useMemberCouponsPageModel } from '../model/useMemberCouponsPageModel'

const router = useRouter()
const { errorMessage, isLoading, loadMemberCouponsPage, memberCouponsPageData } = useMemberCouponsPageModel()

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'member' })
}

function formatAmount(value: number) {
  const fixed = value.toFixed(2)
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed.replace(/0$/, '')
}

function formatCouponValue(coupon: MemberCouponListItem) {
  if (coupon.type === 'discount' && coupon.discountRate !== null) {
    return `${formatAmount(coupon.discountRate)} 折`
  }

  if (coupon.discountAmount > 0) {
    return `减 ${formatAmount(coupon.discountAmount)} 元`
  }

  return coupon.name
}

function shouldDisplayCouponName(coupon: MemberCouponListItem) {
  return formatCouponValue(coupon) !== coupon.name
}

function formatCouponCondition(coupon: MemberCouponListItem) {
  if (coupon.minimumAmount <= 0) {
    return '无门槛可用'
  }

  return `满 ${formatAmount(coupon.minimumAmount)} 元可用`
}

function formatCouponWindow(coupon: MemberCouponListItem) {
  const start = coupon.startsAt ? coupon.startsAt.slice(0, 10) : '领取后生效'
  const end = coupon.endsAt ? coupon.endsAt.slice(0, 10) : '长期有效'
  return `${start} 至 ${end}`
}

function resolveCouponStatus(coupon: MemberCouponListItem) {
  if (coupon.usedAt) {
    return 'used'
  }

  const now = Date.now()
  const startsAt = coupon.startsAt ? new Date(coupon.startsAt).getTime() : Number.NaN

  if (Number.isFinite(startsAt) && startsAt > now) {
    return 'upcoming'
  }

  const endsAt = coupon.endsAt ? new Date(coupon.endsAt).getTime() : Number.NaN

  if (Number.isFinite(endsAt) && endsAt < now) {
    return 'expired'
  }

  return 'available'
}

function shouldDisplayCoupon(coupon: MemberCouponListItem) {
  return resolveCouponStatus(coupon) !== 'used'
}

function resolveCouponStatusText(coupon: MemberCouponListItem) {
  switch (resolveCouponStatus(coupon)) {
    case 'used':
      return '已使用'
    case 'expired':
      return '已过期'
    case 'upcoming':
      return '未开始'
    default:
      return '可使用'
  }
}

const couponItems = computed(() =>
  memberCouponsPageData.value.items
    .filter(shouldDisplayCoupon)
    .sort((left, right) => {
      const statusOrder = {
        available: 0,
        upcoming: 1,
        expired: 2,
        used: 3,
      } as const

      const leftStatus = statusOrder[resolveCouponStatus(left)]
      const rightStatus = statusOrder[resolveCouponStatus(right)]

      if (leftStatus !== rightStatus) {
        return leftStatus - rightStatus
      }

      return right.userCouponId - left.userCouponId
    }),
)

onMounted(() => {
  void loadMemberCouponsPage()
})

onActivated(() => {
  void loadMemberCouponsPage()
})
</script>

<template>
  <section class="member-coupons-page">
    <PageTopBar title="我的优惠券" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">{{ errorMessage }}</p>
      <LoadingState v-else-if="isLoading" />

      <EmptyState
        v-else-if="couponItems.length === 0"
        boxed
        class="empty-state"
        description="当前账户还没有可展示的优惠券，去店铺首页领券后会显示在这里。"
        description-width="240px"
        icon="coupon-o"
        title="暂无优惠券"
      />

      <div v-else class="coupon-list">
        <CouponCard
          v-for="coupon in couponItems"
          :key="coupon.userCouponId"
          :headline="formatCouponValue(coupon)"
          :highlighted="resolveCouponStatus(coupon) === 'available'"
          :meta-items="[
            formatCouponCondition(coupon),
            coupon.merchantName || '指定商家可用',
            formatCouponWindow(coupon),
          ]"
          :muted="resolveCouponStatus(coupon) !== 'available'"
          :title="shouldDisplayCouponName(coupon) ? coupon.name : null"
        >
          <template #side>
            <span
              class="coupon-card-status"
              :class="{ 'coupon-card-status-muted': resolveCouponStatus(coupon) !== 'available' }"
            >
              {{ resolveCouponStatusText(coupon) }}
            </span>
          </template>
        </CouponCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.member-coupons-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(180deg, #fff7ef 0%, #f7f1e9 100%);
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 16px 24px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.status-text {
  margin: 0;
  padding: 18px 0;
  color: #8c8a86;
  font-size: 13px;
  text-align: center;
}

.coupon-list {
  display: grid;
  gap: 12px;
}

.coupon-card-status {
  flex: 0 0 auto;
  min-width: 64px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #fff4ec;
  color: #c2410c;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.coupon-card-status-muted {
  background: #f3f0eb;
  color: #8c8a86;
}

.empty-state {
  margin-top: 12px;
}
</style>
