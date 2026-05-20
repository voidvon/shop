<script setup lang="ts">
defineProps<{
  statusText: string
  storeName: string
}>()
</script>

<template>
  <header class="store-header">
    <div class="store-name-wrap">
      <van-icon name="shop-o" size="18" />
      <strong>{{ storeName }}</strong>
    </div>

    <span class="store-status">{{ statusText }}</span>
  </header>
</template>

<style scoped>
.store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 0 16px;
}

.store-name-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  color: var(--color-warning);
}

.store-name-wrap strong {
  overflow: hidden;
  color: var(--color-text);
  font-size: 15px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-status {
  color: var(--color-warning);
  font-size: 14px;
  font-weight: 600;
}
</style>
