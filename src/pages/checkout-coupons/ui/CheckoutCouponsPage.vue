<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import CouponCard from '@/shared/ui/CouponCard.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import { useCheckoutFlowStore } from '@/processes/checkout-flow/model/useCheckoutFlowStore'

const route = useRoute()
const router = useRouter()
const checkoutStore = useCheckoutFlowStore()
const { errorMessage, isLoading, preview } = storeToRefs(checkoutStore)

const merchantId = computed(() => {
  const rawValue = typeof route.query.merchantId === 'string' ? Number.parseInt(route.query.merchantId, 10) : NaN
  return Number.isFinite(rawValue) ? rawValue : null
})

const balanceTypeId = computed(() => {
  const rawValue = typeof route.query.balanceTypeId === 'string' ? Number.parseInt(route.query.balanceTypeId, 10) : NaN
  return Number.isFinite(rawValue) ? rawValue : null
})

const couponGroup = computed(() => {
  if (merchantId.value === null || balanceTypeId.value === null) {
    return null
  }

  return checkoutStore.findCouponGroup(merchantId.value, balanceTypeId.value)
})

const availableCoupons = computed(() => couponGroup.value?.availableCoupons ?? [])

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push({ name: 'checkout' })
}

function formatAmount(value: number) {
  const fixed = value.toFixed(2)
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed.replace(/0$/, '')
}

function resolveCouponValue(discountAmount: number, discountRate: number | null, type: string | null) {
  if (type === 'discount' && discountRate !== null) {
    return {
      suffix: '折',
      value: formatAmount(discountRate),
    }
  }

  if (discountAmount > 0) {
    return {
      smallSuffix: true,
      suffix: '元',
      value: formatAmount(discountAmount),
    }
  }

  return {
    smallSuffix: false,
    suffix: null,
    value: null,
  }
}

function formatCouponCondition(minimumAmount: number) {
  if (minimumAmount <= 0) {
    return '无门槛'
  }

  return `满${formatAmount(minimumAmount)}可用`
}

async function handleSelectCoupon(userCouponId: number | null) {
  const group = couponGroup.value

  if (!group) {
    showFailToast('当前优惠券分组不存在')
    return
  }

  try {
    await checkoutStore.applyCouponSelection(group, userCouponId)
    showSuccessToast(userCouponId === null ? '已取消使用优惠券' : '优惠券已更新')
    goBack()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '优惠券更新失败')
  }
}

onMounted(async () => {
  if (!preview.value) {
    await checkoutStore.loadPreview()
  }

  if (errorMessage.value) {
    showFailToast(errorMessage.value)
  }
})
</script>

<template>
  <section class="checkout-coupons-page">
    <PageTopBar title="选择优惠券" @back="goBack" />

    <div class="checkout-coupons-body">
      <LoadingState v-if="isLoading" class="state-card" />

      <p v-else-if="errorMessage && !preview" class="state-card state-card-error">
        {{ errorMessage }}
      </p>

      <template v-else-if="couponGroup">
        <section class="group-summary">
          <strong>{{ couponGroup.merchantName }}</strong>
          <p>订单金额 ¥{{ formatAmount(couponGroup.totalAmount) }}，当前最多可选 1 张券</p>
        </section>

        <CouponCard
          tag="button"
          type="button"
          surface="neutral"
          :subtitle="'返回确认订单页后重新计算应付金额'"
          :selected="couponGroup.userCouponId === null"
          title="不使用优惠券"
          @click="handleSelectCoupon(null)"
        >
          <template #side>
            <span class="coupon-card-action">{{ couponGroup.userCouponId === null ? '已选' : '选择' }}</span>
          </template>
        </CouponCard>

        <div v-if="availableCoupons.length > 0" class="coupon-list">
          <CouponCard
            v-for="coupon in availableCoupons"
            :key="coupon.userCouponId"
            tag="button"
            type="button"
            :selected="couponGroup.userCouponId === coupon.userCouponId"
            :small-value-suffix="resolveCouponValue(coupon.discountAmount, coupon.discountRate, coupon.type).smallSuffix"
            :subtitle="formatCouponCondition(coupon.minimumAmount)"
            :title="coupon.name"
            :value="resolveCouponValue(coupon.discountAmount, coupon.discountRate, coupon.type).value"
            :value-suffix="resolveCouponValue(coupon.discountAmount, coupon.discountRate, coupon.type).suffix"
            @click="handleSelectCoupon(coupon.userCouponId)"
          >
            <template #side>
              <span class="coupon-card-action">
                {{ couponGroup.userCouponId === coupon.userCouponId ? '已选' : '选择' }}
              </span>
            </template>
          </CouponCard>
        </div>

        <EmptyState
          v-else
          boxed
          class="empty-state"
          description="当前订单分组没有满足门槛的可用优惠券。"
          icon="coupon-o"
          title="暂无可用优惠券"
        />
      </template>

      <EmptyState
        v-else
        boxed
        class="empty-state"
        description="请返回确认订单页重新进入优惠券选择。"
        icon="coupon-o"
        title="未找到优惠券分组"
      />
    </div>
  </section>
</template>

<style scoped>
.checkout-coupons-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at top right, rgba(255, 122, 36, 0.18), transparent 28%),
    linear-gradient(180deg, #fcf7f1 0%, #f5eee4 100%);
  overflow: hidden;
}

.checkout-coupons-body {
  display: grid;
  gap: 12px;
  align-content: start;
  min-height: 0;
  padding: 12px 16px 24px;
  overflow-y: auto;
}

.state-card,
.group-summary {
  border: 0;
  border-radius: 18px;
  background: #fff;
}

.state-card {
  margin: 0;
  padding: 16px;
  color: #6d6c6a;
  font-size: 14px;
  line-height: 1.6;
}

.state-card-error {
  color: #c95a21;
}

.group-summary {
  padding: 16px;
}

.group-summary strong {
  display: block;
  color: #2f2a24;
  font-size: 17px;
  font-weight: 700;
}

.group-summary p {
  margin: 8px 0 0;
  color: #7a7267;
  font-size: 13px;
  line-height: 1.5;
}

.coupon-list {
  display: grid;
  gap: 12px;
}

.coupon-card-action {
  flex: none;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f97316;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.empty-state {
  margin-top: 8px;
}
</style>
