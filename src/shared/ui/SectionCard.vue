<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="section-card">
    <header class="section-head">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <slot name="action" />
    </header>

    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section-card {
  padding: 24px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
  margin-bottom: 18px;
}

h2 {
  margin: 0;
  font-size: 1.35rem;
}

p {
  margin: 8px 0 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

.section-body {
  display: grid;
  gap: 16px;
}
</style>
