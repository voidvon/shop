import { createApp } from 'vue'

import App from '@/app/App.vue'
import { provideBackendRuntime } from '@/app/providers/backend'
import { createPiniaInstance } from '@/app/providers/pinia'
import { router } from '@/app/router'
import '@/app/styles/index.css'
import 'nprogress/nprogress.css'
import 'vant/es/dialog/style'
import 'vant/es/skeleton/style'
import 'vant/es/toast/style'

const app = createApp(App)

provideBackendRuntime(app)
app.use(createPiniaInstance())
app.use(router)

app.mount('#app')
