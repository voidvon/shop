<script setup lang="ts">
defineProps<{
  imageAlt: string
  imageUrl?: string
  metaText?: string
  priceText?: string
  title: string
  trailingText?: string
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
        <strong>{{ title }}</strong>

        <div v-if="priceText" class="price-row">
          <span class="price-symbol">¥</span>
          <span>{{ priceText }}</span>
        </div>

        <span v-if="metaText" class="product-meta">{{ metaText }}</span>
      </div>
    </div>

    <span v-if="trailingText" class="product-trailing">{{ trailingText }}</span>
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

.price-symbol {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.product-meta {
  overflow: hidden;
  color: #9c9b99;
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-trailing {
  display: flex;
  align-items: flex-end;
  color: #6d6c6a;
  font-size: 13px;
  font-weight: 500;
}
</style>
