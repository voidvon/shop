/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_TARGET?: 'mock' | 'backend-a'
  readonly VITE_ENABLED_MODULES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
