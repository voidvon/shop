<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useStoreProfile } from '@/features/store-profile'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

const route = useRoute()
const router = useRouter()

const storeId = computed(() => String(route.params.storeId ?? ''))
const preferredStoreName = computed(() =>
  typeof route.query.name === 'string' ? route.query.name : null,
)

const {
  errorMessage,
  isLoading,
  storeAddress,
  storeBenefits,
  storeBusinessHours,
  storeFollowerCount,
  storeLogoUrl,
  storeName,
  storePhone,
  storeStats,
  storeSummary,
} = useStoreProfile(storeId, preferredStoreName)

const infoRows = computed(() => [
  {
    key: 'followers',
    icon: 'friends-o',
    label: '关注人数',
    value: storeFollowerCount.value > 0 ? `${storeFollowerCount.value} 人关注` : '暂无关注数据',
  },
  {
    key: 'products',
    icon: 'gift-o',
    label: '在售商品',
    value: `${storeStats.value.onSaleCount} 件在售 · 共 ${storeStats.value.productCount} 件商品`,
  },
  {
    key: 'hours',
    icon: 'clock-o',
    label: '营业时间',
    value: storeBusinessHours.value ?? '营业时间暂未配置',
  },
  {
    key: 'phone',
    icon: 'phone-o',
    label: '联系电话',
    value: storePhone.value ?? '联系电话暂未配置',
  },
  {
    key: 'address',
    icon: 'location-o',
    label: '店铺地址',
    value: storeAddress.value ?? '店铺地址暂未配置',
  },
])

const highlightedBenefits = computed(() => storeBenefits.value.slice(0, 6))
const storeStatus = computed(() => {
  if (storeSummary.value?.trim()) {
    return storeSummary.value.trim()
  }

  if (storeStats.value.monthlySales > 0) {
    return `累计月销 ${storeStats.value.monthlySales}`
  }

  return '店铺信息完善后会在此处展示'
})

function goBack() {
  if (globalThis.window?.history.state?.back) {
    router.back()
    return
  }

  void router.push({
    name: 'store-detail',
    params: {
      storeId: storeId.value,
    },
    query: {
      ...(storeName.value ? { name: storeName.value } : {}),
    },
  })
}
</script>

<template>
  <section class="store-about-page">
    <PageTopBar title="关于我们" @back="goBack" />

    <div class="store-about-scroll">
      <section class="store-profile-card">
        <div class="store-profile-head">
          <div class="store-logo">
            <img v-if="storeLogoUrl" :src="storeLogoUrl" :alt="storeName" class="store-logo-image">
            <van-icon v-else name="shop-o" size="28" />
          </div>

          <div class="store-copy">
            <p class="store-eyebrow">STORE PROFILE</p>
            <h1>{{ storeName }}</h1>
            <p class="store-status">{{ storeStatus }}</p>
          </div>
        </div>

        <div v-if="highlightedBenefits.length > 0" class="benefit-chip-list">
          <span v-for="item in highlightedBenefits" :key="item" class="benefit-chip">{{ item }}</span>
        </div>
      </section>

      <p v-if="errorMessage" class="status-card">
        {{ errorMessage }}
      </p>
      <LoadingState v-else-if="isLoading" class="status-card" />

      <section v-else class="store-about-section">
        <header class="section-head">
          <span class="section-accent" />
          <strong>店铺信息</strong>
        </header>

        <div class="store-info-grid">
          <article v-for="item in infoRows" :key="item.key" class="store-info-item">
            <div class="store-info-label">
              <van-icon :name="item.icon" size="16" />
              <span>{{ item.label }}</span>
            </div>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.store-about-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(214, 120, 48, 0.18), transparent 34%),
    linear-gradient(180deg, #f6f1ea 0%, #f2eee9 100%);
  overflow: hidden;
}

.store-about-scroll {
  display: grid;
  align-content: start;
  gap: 16px;
  min-height: 0;
  padding: 16px 16px 32px;
  overflow-y: auto;
}

.store-profile-card,
.store-about-section,
.status-card {
  width: 100%;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(69, 44, 18, 0.08);
}

.store-profile-card {
  display: grid;
  gap: 18px;
  padding: 20px 18px;
}

.store-profile-head {
  display: flex;
  gap: 14px;
  align-items: center;
}

.store-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 24px;
  background: linear-gradient(180deg, #d7602e 0%, #9f3f16 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.store-logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.store-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.store-eyebrow {
  margin: 0;
  color: #b06a33;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.store-copy h1 {
  margin: 0;
  color: #261d17;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.store-status {
  margin: 0;
  color: #756b63;
  font-size: 13px;
  line-height: 1.7;
}

.benefit-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.benefit-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff2e5;
  color: #b45a1c;
  font-size: 12px;
  font-weight: 600;
}

.store-about-section {
  display: grid;
  gap: 14px;
  padding: 18px 16px;
}

.section-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #2d261f;
  font-size: 16px;
}

.section-accent {
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f08a3e 0%, #d65628 100%);
}

.store-info-grid {
  display: grid;
  gap: 10px;
}

.store-info-item {
  display: grid;
  gap: 6px;
  padding: 13px 14px;
  border-radius: 16px;
  background: #faf6f1;
}

.store-info-label {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #8c857f;
  font-size: 12px;
}

.store-info-item strong {
  color: #2f2a26;
  font-size: 14px;
  line-height: 1.6;
}

.status-card {
  margin: 0;
  padding: 18px 16px;
  color: #726a63;
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
}
</style>
