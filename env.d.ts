/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_TARGET?: 'mock' | 'backend-a'
  readonly VITE_BACKEND_A_MEMBER_ASSETS_BASE_URL?: string
  readonly VITE_BACKEND_A_MEMBER_ASSETS_TIMEOUT_MS?: string
  readonly VITE_DEV_MEMBER_ACCESS_TOKEN?: string
  readonly VITE_ENABLED_MODULES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
