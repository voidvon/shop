/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_TARGET?: 'mock' | 'backend-a'
  readonly VITE_BACKEND_A_BASE_URL?: string
  readonly VITE_BACKEND_A_ENABLE_INVOICE?: string
  readonly VITE_BACKEND_A_TIMEOUT_MS?: string
  readonly VITE_BACKEND_A_MEMBER_ASSETS_BASE_URL?: string
  readonly VITE_BACKEND_A_MEMBER_ASSETS_TIMEOUT_MS?: string
  readonly VITE_BACKEND_A_WECHAT_APP_ID?: string
  readonly VITE_BACKEND_A_WECHAT_OAUTH_SCOPE?: 'snsapi_base' | 'snsapi_userinfo'
  readonly VITE_BACKEND_A_WECHAT_OAUTH_URL?: string
  readonly VITE_DEV_MEMBER_ACCESS_TOKEN?: string
  readonly VITE_DEV_MEMBER_CARD_NO?: string
  readonly VITE_DEV_MEMBER_CARD_SECRET?: string
  readonly VITE_ENABLED_MODULES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const Version: string | undefined
