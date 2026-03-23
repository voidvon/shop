<script setup lang="ts">
import PageTopBar from '@/shared/ui/PageTopBar.vue'

defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <section class="member-settings-subpage">
    <PageTopBar :title="title" @back="emit('back')" />

    <div class="content-scroll">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.member-settings-subpage {
  display: grid;
  grid-template-rows: 49px minmax(0, 1fr);
  height: 100vh;
  height: 100dvh;
  background: var(--van-background-2);
  overflow: hidden;
}

.content-scroll {
  min-height: 0;
  padding: 12px 0 24px;
  overflow-y: auto;
}
</style>
