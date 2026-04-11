import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

const buildVersionTimeZone = 'Asia/Shanghai'

function createBuildVersion() {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: buildVersionTimeZone,
  }).formatToParts(new Date())

  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const day = partMap.day ?? '00'
  const hour = partMap.hour ?? '00'
  const minute = partMap.minute ?? '00'
  const random = Math.floor(Math.random() * 9000) + 1000

  return `${day}${hour}${minute}.${random}`
}

const buildVersion = createBuildVersion()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'inject-build-version',
      transformIndexHtml(html) {
        return html.replace('__APP_VERSION__', buildVersion)
      },
    },
    vue(),
    AutoImport({
      dts: 'src/shared/types/auto-imports.d.ts',
      resolvers: [VantResolver()],
    }),
    Components({
      dts: 'src/shared/types/components.d.ts',
      resolvers: [VantResolver()],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 8888,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
