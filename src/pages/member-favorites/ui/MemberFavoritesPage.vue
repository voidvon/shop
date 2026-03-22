<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'

import EmptyState from '@/shared/ui/EmptyState.vue'
import PageTopBar from '@/shared/ui/PageTopBar.vue'
import ProductMediaRow from '@/shared/ui/ProductMediaRow.vue'

import { useMemberFavoritesPageModel } from '../model/useMemberFavoritesPageModel'

const router = useRouter()
const {
  errorMessage,
  isLoading,
  loadMemberFavoritesPage,
  memberFavoritesPageData,
  removeFavorite,
} = useMemberFavoritesPageModel()

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

async function handleRemoveFavorite(productId: string) {
  await removeFavorite(productId)
  showSuccessToast('已取消收藏')
}

onMounted(() => {
  void loadMemberFavoritesPage()
})
</script>

<template>
  <section class="member-product-page">
    <PageTopBar title="我的收藏" @back="goBack" />

    <div class="content-scroll">
      <p v-if="errorMessage" class="status-text">
        {{ errorMessage }}
      </p>

      <p v-else-if="isLoading" class="status-text">
        收藏内容加载中...
      </p>

      <EmptyState
        v-else-if="memberFavoritesPageData.items.length === 0"
        description="去首页或分类页逛逛，把感兴趣的商品收藏起来。"
        description-width="240px"
        icon="star-o"
        layout="fill"
        title="还没有收藏商品"
      />

      <div v-else class="product-list">
        <article
          v-for="item in memberFavoritesPageData.items"
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
            <button class="ghost-action-button" type="button" @click="handleRemoveFavorite(item.productId)">
              取消收藏
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
