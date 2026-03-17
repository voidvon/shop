<script setup lang="ts">
import { computed, toRef } from 'vue'
import { RouterLink } from 'vue-router'

import { ProductDetailView } from '@/entities/product'
import { currentBackendLabel } from '@/shared/config/backend'
import SectionCard from '@/shared/ui/SectionCard.vue'

import { useProductDetailPageModel } from '../model/useProductDetailPageModel'

const props = defineProps<{
  productId: string
}>()

const { errorMessage, isLoading, isNotFound, loadProductDetail, product } = useProductDetailPageModel(
  toRef(props, 'productId'),
)

const pageDescription = computed(
  () => `详情数据由 entity 仓储返回 ProductDetail，当前接入：${currentBackendLabel}`,
)
</script>

<template>
  <SectionCard title="商品详情" :description="pageDescription">
    <template #action>
      <RouterLink class="back-link" to="/">返回首页</RouterLink>
    </template>

    <p v-if="isLoading" class="state">正在加载商品详情...</p>

    <div v-else-if="errorMessage" class="state error-state">
      <p>{{ errorMessage }}</p>
      <van-button round type="primary" size="small" @click="loadProductDetail">重新加载</van-button>
    </div>

    <div v-else-if="isNotFound" class="state">
      <p>未找到对应商品，可能已下架或当前后端未提供该详情能力。</p>
      <RouterLink class="back-link" to="/">返回商品目录</RouterLink>
    </div>

    <ProductDetailView v-else-if="product" :product="product" />
  </SectionCard>
</template>

<style scoped>
.state {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 251, 245, 0.7);
  color: var(--color-text-soft);
}

.state p {
  margin: 0;
}

.error-state {
  color: var(--color-primary-deep);
}

.back-link {
  color: var(--color-primary-deep);
  font-weight: 600;
}
</style>
