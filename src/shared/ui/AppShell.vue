<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useEnabledModuleManifests } from '@/shared/lib/modules'
import { useNavigationItems } from '@/shared/lib/navigation'

const enabledModuleManifests = useEnabledModuleManifests()
const navigationItems = useNavigationItems()
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

    <div class="module-bar">
      <span class="module-bar-label">当前模块</span>
      <ul class="module-list">
        <li v-for="moduleItem in enabledModuleManifests" :key="moduleItem.id" class="module-pill">
          <strong>{{ moduleItem.label }}</strong>
          <span>{{ moduleItem.entry }}</span>
        </li>
      </ul>
    </div>

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

.module-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 4px;
  margin-bottom: 20px;
}

.module-bar-label {
  color: var(--color-text-soft);
  font-size: 0.84rem;
  white-space: nowrap;
}

.module-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.module-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  background: rgba(255, 251, 245, 0.65);
}

.module-pill strong,
.module-pill span {
  display: block;
}

.module-pill strong {
  font-size: 0.9rem;
}

.module-pill span {
  color: var(--color-text-soft);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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

  .module-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
