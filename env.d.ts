/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_TARGET?: 'mock' | 'backend-a'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
