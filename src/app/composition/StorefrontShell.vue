<script setup lang="ts">
import { computed } from 'vue'

import { HomePage } from '@/pages/home'
import { useEnabledModuleManifests } from '@/shared/lib/modules'

import { resolveHomeModulePanels } from './module-composition-registry'

const enabledModules = useEnabledModuleManifests()

const activePanels = computed(() =>
  resolveHomeModulePanels(enabledModules.map((moduleItem) => moduleItem.id)),
)

const mainPanels = computed(() => activePanels.value.filter((panel) => panel.area === 'main'))
const railPanels = computed(() => activePanels.value.filter((panel) => panel.area === 'rail'))
</script>

<template>
  <section class="storefront-shell">
    <HomePage />

    <div class="content-grid">
      <div class="main-column">
        <component
          :is="panel.component"
          v-for="panel in mainPanels"
          :key="panel.moduleId"
        />
      </div>

      <aside v-if="railPanels.length > 0" class="rail-column">
        <component
          :is="panel.component"
          v-for="panel in railPanels"
          :key="panel.moduleId"
        />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.storefront-shell {
  display: grid;
  gap: 24px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
  gap: 24px;
  align-items: start;
}

.main-column,
.rail-column {
  display: grid;
  gap: 24px;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
