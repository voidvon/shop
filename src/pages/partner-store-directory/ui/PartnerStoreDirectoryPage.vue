<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'

import { usePartnerStoreDirectoryPageModel } from '../model/usePartnerStoreDirectoryPageModel'

const route = useRoute()
const router = useRouter()
const storeTypeId = computed(() => String(route.params.storeTypeId ?? ''))
const preferredTitle = computed(() => (
  typeof route.query.label === 'string' && route.query.label.trim()
    ? route.query.label.trim()
    : ''
))

const {
  errorMessage,
  hasRegions,
  isLoading,
  isLoadingMerchants,
  loadPage,
  merchants,
  regions,
  resolvedStoreTypeLabel,
  selectRegion,
  selectedRegionId,
  selectedRegionLabel,
} = usePartnerStoreDirectoryPageModel(storeTypeId, preferredTitle)

const pageTitle = computed(() => (
  resolvedStoreTypeLabel.value
  || merchants.value[0]?.storeTypeLabels[0]
  || '合作门店'
))

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/')
}

function goToStoreDetail(merchantId: string, merchantName: string) {
  void router.push({
    name: 'store-detail',
    params: { storeId: merchantId },
    query: { name: merchantName },
  })
}

onMounted(() => {
  void loadPage()
})

watch(storeTypeId, () => {
  void loadPage()
})
</script>

<template>
  <section class="partner-store-directory-page">
    <PageTopBar :title="pageTitle" @back="goBack" />

    <div class="directory-body">
      <aside class="region-panel" aria-label="地区列表">
        <div class="region-panel-head">
          <strong>地区</strong>
        </div>

        <div v-if="hasRegions" class="region-list">
          <button
            v-for="region in regions"
            :key="region.id"
            class="region-item"
            :class="{ 'region-item-active': region.id === selectedRegionId }"
            type="button"
            @click="selectRegion(region.id)"
          >
            {{ region.label }}
          </button>
        </div>

        <div v-else class="region-empty">
          <span>暂无地区</span>
        </div>
      </aside>

      <main class="merchant-panel">
        <div class="merchant-panel-intro">
          <strong>{{ pageTitle }}</strong>
          <span>按地区查看合作商家</span>
        </div>

        <div class="merchant-panel-head">
          <div>
            <strong>{{ selectedRegionLabel || '合作商家' }}</strong>
            <span>{{ merchants.length }} 家门店</span>
          </div>
        </div>

        <p v-if="errorMessage && !isLoading" class="status-text">
          {{ errorMessage }}
        </p>

        <LoadingState v-else-if="isLoading || isLoadingMerchants" />

        <div v-else-if="merchants.length > 0" class="merchant-list">
          <button
            v-for="merchant in merchants"
            :key="merchant.id"
            class="merchant-card"
            type="button"
            @click="goToStoreDetail(merchant.id, merchant.name)"
          >
            <img
              class="merchant-cover"
              :src="merchant.imageUrl || '/images/image-placeholder.svg'"
              :alt="merchant.name"
            >

            <div class="merchant-copy">
              <div class="merchant-title-row">
                <strong>{{ merchant.shortName || merchant.name }}</strong>
                <span v-if="merchant.storeTypeLabels.length > 0">{{ merchant.storeTypeLabels[0] }}</span>
              </div>
              <p>{{ merchant.name }}</p>
              <dl class="merchant-meta">
                <div>
                  <dt>营业</dt>
                  <dd>{{ merchant.businessHours || '待补充' }}</dd>
                </div>
                <div>
                  <dt>电话</dt>
                  <dd>{{ merchant.phone || '待补充' }}</dd>
                </div>
                <div>
                  <dt>地址</dt>
                  <dd>{{ merchant.address }}</dd>
                </div>
              </dl>
            </div>
          </button>
        </div>

        <section v-else class="merchant-empty">
          <EmptyState
            description="当前地区暂时还没有可展示的合作门店。"
            description-width="220px"
            icon="shop-o"
            title="暂无合作门店"
          />
        </section>
      </main>
    </div>
  </section>
</template>

<style scoped>
.partner-store-directory-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(219, 168, 85, 0.16), transparent 28%),
    linear-gradient(180deg, #f7f1e6 0%, #f3efe8 100%);
}

.merchant-card,
.region-item {
  padding: 0;
  border: 0;
  background: transparent;
}

.directory-body {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.region-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
  border-right: 1px solid rgba(151, 113, 55, 0.12);
  background: rgba(255, 252, 247, 0.76);
}

.region-panel-head,
.merchant-panel-head {
  padding: 16px 14px 12px;
}

.region-panel-head strong,
.merchant-panel-head strong {
  color: #4d3924;
  font-size: 14px;
  font-weight: 700;
}

.region-list {
  min-height: 0;
  padding: 0 10px 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.region-list::-webkit-scrollbar,
.merchant-panel::-webkit-scrollbar {
  display: none;
}

.region-item {
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 8px;
  border-radius: 12px;
  color: #70563a;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
}

.region-item-active {
  background: linear-gradient(180deg, #b78347 0%, #966733 100%);
  color: #fffaf2;
  box-shadow: 0 10px 24px rgba(150, 103, 51, 0.22);
}

.region-empty {
  padding: 12px;
  color: #9d8b75;
  font-size: 12px;
  text-align: center;
}

.merchant-panel {
  min-height: 0;
  padding: 0 16px 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.merchant-panel-intro {
  display: grid;
  gap: 4px;
  padding: 16px 0 4px;
}

.merchant-panel-intro strong {
  color: #2f2418;
  font-size: 18px;
  font-weight: 700;
}

.merchant-panel-intro span {
  color: #8a7458;
  font-size: 12px;
}

.merchant-panel-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding-left: 0;
  padding-right: 0;
}

.merchant-panel-head > div {
  display: flex;
  gap: 16px;
  align-items: end;
}

.merchant-panel-head span {
  color: #9d8668;
  font-size: 12px;
}

.status-text {
  margin: 0;
  padding: 28px 0;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
}

.merchant-list {
  display: grid;
  gap: 12px;
}

.merchant-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12px 28px rgba(80, 56, 28, 0.08);
  text-align: left;
}

.merchant-cover {
  display: block;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  background: #ece4d6;
}

.merchant-copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.merchant-title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.merchant-title-row strong {
  min-width: 0;
  color: #332618;
  font-size: 15px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-title-row span {
  display: inline-flex;
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(183, 131, 71, 0.12);
  color: #9c6930;
  font-size: 11px;
  font-weight: 600;
}

.merchant-copy > p {
  margin: 0;
  color: #85715a;
  font-size: 12px;
  line-height: 1.4;
}

.merchant-meta {
  display: grid;
  gap: 6px;
  margin: 0;
}

.merchant-meta div {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 6px;
}

.merchant-meta dt {
  color: #b49a79;
  font-size: 11px;
}

.merchant-meta dd {
  margin: 0;
  color: #5f4d39;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
}

.merchant-empty {
  min-height: 280px;
  display: grid;
  align-content: center;
}
</style>
