<script setup lang="ts">
const props = defineProps<{
  imageAlt: string
  imageUrl?: string
  priceText: string
  productName: string
  quantityText: string
}>()
</script>

<template>
  <article class="product-row">
    <div class="product-main">
      <div class="product-image" :class="{ 'product-image-empty': !imageUrl }">
        <img v-if="imageUrl" :src="imageUrl" :alt="imageAlt">
        <van-icon v-else name="photo-o" size="18" />
      </div>

      <div class="product-info">
        <strong>{{ productName }}</strong>
        <div class="price-row">
          <i class="coin-dot" />
          <span>{{ priceText }}</span>
        </div>
      </div>
    </div>

    <span class="product-qty">{{ quantityText }}</span>
  </article>
</template>

<style scoped>
.product-row {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
}

.product-main {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.product-image {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 84px;
  height: 84px;
  overflow: hidden;
  border-radius: 10px;
  background: #f1ece6;
  color: #c9bdaf;
}

.product-image-empty {
  background: linear-gradient(135deg, #efe9e1 0%, #f7f3ee 100%);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: grid;
  flex: 1;
  gap: 10px;
  align-content: start;
  min-width: 0;
}

.product-info strong {
  display: -webkit-box;
  overflow: hidden;
  color: #3c3b39;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.price-row {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  width: fit-content;
  color: #ea580c;
  font-size: 18px;
  font-weight: 700;
}

.coin-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #f4b63d;
}

.product-qty {
  display: flex;
  align-items: flex-end;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
}
</style>
