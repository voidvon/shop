<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { ProductCard } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { currentBackendLabel } from '@/shared/config/backend'
import LoadingState from '@/shared/ui/LoadingState.vue'
import SectionCard from '@/shared/ui/SectionCard.vue'

import { useProductCatalogStore } from '../model/useProductCatalogStore'

const catalogStore = useProductCatalogStore()
const { availableCount, errorMessage, isLoading, keyword, totalInventory, visibleProducts } =
  storeToRefs(catalogStore)

async function reloadCatalog() {
  await catalogStore.loadProducts()

  if (!catalogStore.errorMessage) {
    showSuccessToast('商品目录已刷新')
  }
}

onMounted(() => {
  if (catalogStore.visibleProducts.length === 0) {
    void catalogStore.loadProducts()
  }
})
</script>

<template>
  <SectionCard
    title="商品目录 Feature"
    :description="`搜索输入留在 feature 层，商品规则与数据来源由 entity 内部负责。当前接入：${currentBackendLabel}`"
  >
    <div class="toolbar">
      <div class="search-field">
        <span>检索商品</span>
        <van-search v-model="keyword" shape="round" placeholder="按名称、分类或标签过滤" />
      </div>

      <div class="actions">
        <van-button round type="primary" @click="reloadCatalog">刷新目录</van-button>
      </div>
    </div>

    <div class="stats">
      <div>
        <strong>{{ availableCount }}</strong>
        <span>在架商品</span>
      </div>
      <div>
        <strong>{{ totalInventory }}</strong>
        <span>总库存</span>
      </div>
    </div>

    <LoadingState v-if="isLoading" class="state" />
    <p v-else-if="errorMessage" class="state error">{{ errorMessage }}</p>

    <div v-else class="catalog-grid">
      <ProductCard v-for="product in visibleProducts" :key="product.id" :product="product">
        <template #action>
          <div class="card-actions">
            <RouterLink
              class="detail-link"
              :to="{ name: 'product-detail', params: { productId: product.id } }"
            >
              查看详情
            </RouterLink>
            <AddToCartButton :product="product" />
          </div>
        </template>
      </ProductCard>
    </div>
  </SectionCard>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
  margin-bottom: 16px;
}

.search-field {
  display: grid;
  gap: 8px;
  flex: 1;
  font-weight: 600;
}

.search-field span {
  font-size: 0.92rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.stats {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
}

.stats div {
  min-width: 120px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-line);
  background: rgba(255, 255, 255, 0.76);
}

.stats strong,
.stats span {
  display: block;
}

.stats strong {
  font-size: 1.4rem;
}

.stats span {
  color: var(--color-text-soft);
  font-size: 0.88rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.detail-link {
  color: var(--color-primary-deep);
  font-weight: 600;
}

.state {
  margin: 0;
  padding: 16px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.7);
  color: var(--color-text-soft);
}

.error {
  color: var(--color-primary-deep);
}

@media (max-width: 960px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    justify-content: stretch;
  }

  .actions :deep(.van-button) {
    width: 100%;
  }

  .stats {
    width: 100%;
  }

  .stats div {
    flex: 1;
  }

  .catalog-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-link {
    text-align: center;
  }
}
</style>
