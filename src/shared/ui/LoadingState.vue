<script setup lang="ts">
withDefaults(defineProps<{
  color?: string
  fill?: boolean
  size?: string | number
  text?: string
}>(), {
  color: '#ea580c',
  fill: false,
  size: 24,
  text: '加载中...',
})
</script>

<template>
  <div
    class="loading-state"
    :class="{ 'loading-state-fill': fill }"
    :aria-label="text"
    aria-live="polite"
    role="status"
  >
    <van-loading :color="color" :size="size" type="spinner" />
    <p class="loading-state-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-state {
  display: grid;
  justify-items: center;
  gap: 10px;
  width: 100%;
  padding: 20px 4px;
  text-align: center;
}

.loading-state-fill {
  align-content: center;
  min-height: 100%;
  padding: 0 4px var(--app-bottom-nav-offset, 96px);
}

.loading-state-text {
  margin: 0;
  color: #9c9b99;
  font-size: 13px;
  line-height: 1;
}
</style>
