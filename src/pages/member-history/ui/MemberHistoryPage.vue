<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'

import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import ProductMediaRow from '@/shared/ui/ProductMediaRow.vue'

import { useMemberHistoryPageModel } from '../model/useMemberHistoryPageModel'

const router = useRouter()
const {
  errorMessage,
  isLoading,
  loadMemberHistoryPage,
  memberHistoryPageData,
  removeHistoryItem,
} = useMemberHistoryPageModel()

function goBack() {
  if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/member')
}

function formatAmount(value: number) {
  return value.toFixed(2)
}

async function handleRemoveHistoryItem(productId: string) {
  const item = memberHistoryPageData.value.items.find((candidate) => candidate.productId === productId)

  if (!item) {
    return
  }

  try {
    await removeHistoryItem(productId)
    showSuccessToast('已清除当前足迹')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '足迹删除失败')
  }
}

onMounted(() => {
  void loadMemberHistoryPage()
})
</script>

<template>
  <section class="member-product-page">
    <PageTopBar title="我的足迹" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <LoadingState v-else-if="isLoading" />

      <EmptyState
        v-else-if="memberHistoryPageData.items.length === 0"
        description="浏览过的商品会在这里汇总，方便你继续回看。"
        description-width="240px"
        icon="clock-o"
        layout="fill"
        title="还没有浏览足迹"
      />

      <div v-else class="product-list">
        <article
          v-for="item in memberHistoryPageData.items"
          :key="item.productId"
        >
          <RouterLink class="product-link" :to="{ name: 'product-detail', params: { productId: item.productId } }">
            <ProductMediaRow
              :image-alt="item.productName"
              :image-url="item.productImageUrl || undefined"
              :meta-text="item.storeName"
              :price-text="formatAmount(item.productPrice)"
              :title="item.productName"
            />
          </RouterLink>

          <div class="action-row">
            <button class="ghost-action-button" type="button" @click="handleRemoveHistoryItem(item.productId)">
              清除足迹
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.member-product-page {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: #fafaf8;
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 0 20px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.status-text {
  margin: 0;
  padding: 20px 16px;
  color: #9c9b99;
  font-size: 13px;
  text-align: center;
}

.product-list {
  display: grid;
  gap: 12px;
}

.product-list article {
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
}

.product-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  padding: 0 16px 14px;
  background: #fff;
}

.ghost-action-button {
  min-width: 88px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e5e4e1;
  border-radius: 999px;
  background: #fff;
  color: #9c9b99;
  font-size: 12px;
  font-weight: 500;
}
</style>
