<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { navigationItems } from '@/shared/config/navigation'
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">S</span>
        <div>
          <p>Shop Frontend</p>
          <small>FSD + DDD baseline</small>
        </div>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="nav-link-active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  z-index: 1;
  width: min(var(--content-width), calc(100vw - 32px));
  margin: 0 auto;
  padding: 24px 0 48px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  padding: 18px 22px;
  margin-bottom: 30px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-xl);
  background: rgba(255, 251, 245, 0.78);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-lg);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: #fff;
  font-weight: 800;
}

.brand p,
.brand small {
  margin: 0;
  display: block;
}

.brand p {
  font-size: 1rem;
  font-weight: 700;
}

.brand small {
  color: var(--color-text-soft);
}

.nav {
  display: flex;
  gap: 10px;
}

.nav-link {
  padding: 10px 16px;
  border-radius: 999px;
  color: var(--color-text-soft);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.nav-link:hover {
  background: rgba(184, 92, 56, 0.08);
  color: var(--color-text);
  transform: translateY(-1px);
}

.nav-link-active {
  background: rgba(184, 92, 56, 0.14);
  color: var(--color-primary-deep);
}

.content {
  display: grid;
  gap: 24px;
}

@media (max-width: 720px) {
  .shell {
    width: min(var(--content-width), calc(100vw - 20px));
    padding-top: 12px;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .nav {
    width: 100%;
  }

  .nav-link {
    flex: 1;
    text-align: center;
  }
}
</style>
