<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface ImageCarouselItem {
  imageUrl: string
  linkUrl?: string | null
  eyebrow?: string | null
  title?: string | null
  description?: string | null
}

withDefaults(
  defineProps<{
    items: ImageCarouselItem[]
    autoplay?: number
    bleedX?: string
    height?: string
    variant?: 'banner' | 'gallery'
  }>(),
  {
    autoplay: 3000,
    bleedX: '0px',
    height: '180px',
    variant: 'banner',
  },
)
</script>

<template>
  <van-swipe
    class="image-carousel"
    :class="`image-carousel-${variant}`"
    :style="{
      '--image-carousel-bleed-x': bleedX,
      '--image-carousel-height': height,
    }"
    :autoplay="items.length > 1 ? autoplay : 0"
    indicator-color="#ffffff"
    lazy-render
  >
    <van-swipe-item v-for="(item, index) in items" :key="`${item.linkUrl ?? 'slide'}-${index}`">
      <component
        :is="item.linkUrl ? RouterLink : 'div'"
        class="slide-link"
        v-bind="item.linkUrl ? { to: item.linkUrl } : {}"
      >
        <img class="slide-image" :src="item.imageUrl" :alt="item.title || `banner-${index + 1}`">

        <div
          v-if="item.eyebrow || item.title || item.description"
          class="slide-overlay"
        >
          <p v-if="item.eyebrow" class="slide-eyebrow">{{ item.eyebrow }}</p>
          <strong v-if="item.title" class="slide-title">{{ item.title }}</strong>
          <span v-if="item.description" class="slide-description">{{ item.description }}</span>
        </div>
      </component>
    </van-swipe-item>

  </van-swipe>
</template>

<style scoped>
.image-carousel {
  width: calc(100% + var(--image-carousel-bleed-x));
  margin-inline: calc(var(--image-carousel-bleed-x) / -2);
  overflow: hidden;
}

.slide-link {
  position: relative;
  display: block;
  width: 100%;
  min-height: var(--image-carousel-height);
  background:
    linear-gradient(135deg, rgba(29, 85, 54, 0.9), rgba(61, 138, 90, 0.72)),
    #3d8a5a;
}

.slide-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.22;
}

.slide-overlay {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  min-height: var(--image-carousel-height);
  align-content: end;
  padding: 24px 20px;
  color: #fff;
}

.slide-eyebrow {
  margin: 0;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  opacity: 0.88;
}

.slide-title {
  display: block;
  max-width: 9ch;
  font-size: 1.9rem;
  line-height: 1.08;
}

.slide-description {
  max-width: 18ch;
  line-height: 1.7;
  opacity: 0.84;
}

.image-carousel-gallery .slide-link {
  background: #f7f2eb;
}

.image-carousel-gallery .slide-image {
  opacity: 1;
}

:deep(.van-swipe__indicators) {
  bottom: 14px;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}

:deep(.van-swipe__indicator) {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
}

:deep(.van-swipe__indicator--active) {
  width: 18px;
  background: #fff;
}
</style>
