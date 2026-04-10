import { getBackendRuntime } from '@/app/providers/backend/backend-runtime-provider'
import { resolveBackendAWechatJsapiConfigUrl } from '@/shared/api/backend-a/backend-a-config'

import { isWechatBrowser } from './wechat-browser'

interface WechatJsApiConfig {
  appId: string
  nonceStr: string
  signature: string
  timestamp: number
}

interface WechatScanResult {
  resultStr?: string
}

interface WechatCheckJsApiResult {
  checkResult?: Record<string, boolean>
}

interface WechatJsSdk {
  checkJsApi?: (options: {
    jsApiList: string[]
    fail?: (error: unknown) => void
    success?: (result: WechatCheckJsApiResult) => void
  }) => void
  config: (options: {
    appId: string
    debug: boolean
    jsApiList: string[]
    nonceStr: string
    signature: string
    timestamp: number
  }) => void
  error: (callback: (error: unknown) => void) => void
  ready: (callback: () => void) => void
  scanQRCode: (options: {
    fail?: (error: unknown) => void
    needResult: 0 | 1
    scanType?: Array<'barCode' | 'qrCode'>
    success?: (result: WechatScanResult) => void
  }) => void
}

declare global {
  interface Window {
    wx?: WechatJsSdk
  }
}

const wechatJsSdkScriptUrl = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
const wechatJsSdkReadyTimeoutMs = 10000
const defaultWechatJsApiList = ['scanQRCode']

let wechatJsSdkPromise: Promise<WechatJsSdk> | null = null
const wechatJsSdkConfigPromiseCache = new Map<string, Promise<WechatJsSdk>>()

function unwrapWechatEnvelope<T>(value: unknown) {
  if (value && typeof value === 'object' && 'data' in value && value.data !== undefined) {
    return value.data as T
  }

  return value as T
}

function normalizeWechatApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (error && typeof error === 'object' && 'errMsg' in error && typeof error.errMsg === 'string') {
    if (error.errMsg.includes('cancel')) {
      return '已取消扫码'
    }

    return error.errMsg
  }

  return fallbackMessage
}

function normalizeWechatJsApiConfig(value: unknown): WechatJsApiConfig {
  const input = unwrapWechatEnvelope<Record<string, unknown>>(value)
  const appId = String(input.appId ?? input.app_id ?? '').trim()
  const nonceStr = String(input.nonceStr ?? input.nonce_str ?? '').trim()
  const signature = String(input.signature ?? '').trim()
  const timestamp = Number(input.timestamp)

  if (!appId || !nonceStr || !signature || !Number.isFinite(timestamp) || timestamp <= 0) {
    throw new Error('微信扫码签名配置无效')
  }

  return {
    appId,
    nonceStr,
    signature,
    timestamp,
  }
}

function getWechatScanSignatureUrl() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.location.href.split('#')[0]
}

function getWechatScanConfigCacheKey(jsApiList: string[]) {
  const pageUrl = getWechatScanSignatureUrl()

  if (!pageUrl) {
    throw new Error('当前环境不支持微信扫码')
  }

  return `${pageUrl}::${[...jsApiList].sort().join(',')}`
}

function createAuthorizedHeaders() {
  const headers = new Headers({
    Accept: 'application/json',
  })
  const accessToken = getBackendRuntime()?.auth.session.getSnapshot().authResult?.session.accessToken

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return headers
}

async function loadWechatJsSdkScript() {
  if (typeof window === 'undefined') {
    throw new Error('当前环境不支持微信扫码')
  }

  if (window.wx) {
    return window.wx
  }

  if (wechatJsSdkPromise) {
    return wechatJsSdkPromise
  }

  wechatJsSdkPromise = new Promise<WechatJsSdk>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-wechat-sdk="true"]')

    if (existingScript) {
      const handleLoad = () => {
        if (window.wx) {
          resolve(window.wx)
          return
        }

        reject(new Error('微信 JS-SDK 加载失败'))
      }
      const handleError = () => reject(new Error('微信 JS-SDK 加载失败'))

      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.dataset.wechatSdk = 'true'
    script.src = wechatJsSdkScriptUrl
    script.onload = () => {
      if (window.wx) {
        resolve(window.wx)
        return
      }

      reject(new Error('微信 JS-SDK 加载失败'))
    }
    script.onerror = () => reject(new Error('微信 JS-SDK 加载失败'))
    document.head.append(script)
  }).catch((error) => {
    wechatJsSdkPromise = null
    throw error
  })

  return wechatJsSdkPromise
}

async function requestWechatJsApiConfig(pageUrl: string) {
  const configUrl = resolveBackendAWechatJsapiConfigUrl()

  if (!configUrl) {
    throw new Error('请配置 VITE_BACKEND_A_WECHAT_JSAPI_CONFIG_URL')
  }

  const requestUrl = new URL(configUrl, window.location.origin)
  requestUrl.searchParams.set('url', pageUrl)

  let response: Response

  try {
    response = await fetch(requestUrl.toString(), {
      headers: createAuthorizedHeaders(),
      method: 'GET',
    })
  } catch {
    throw new Error('微信扫码签名请求失败，请检查网络连接')
  }

  const rawText = await response.text()

  if (!rawText) {
    throw new Error('微信扫码签名接口返回为空')
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(rawText)
  } catch {
    throw new Error('微信扫码签名接口返回格式无效')
  }

  if (!response.ok) {
    const payload = unwrapWechatEnvelope<Record<string, unknown>>(parsedValue)
    const message = typeof payload.message === 'string' ? payload.message : '微信扫码签名请求失败'
    throw new Error(message)
  }

  return normalizeWechatJsApiConfig(parsedValue)
}

async function ensureWechatJsApiAvailable(wx: WechatJsSdk, jsApiList: string[]) {
  const checkJsApi = wx.checkJsApi

  if (!checkJsApi) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    checkJsApi({
      jsApiList,
      fail: (error) => reject(new Error(normalizeWechatApiErrorMessage(error, '当前微信环境不支持扫码'))),
      success: (result) => {
        const unsupportedApiList = jsApiList.filter((api) => result.checkResult?.[api] !== true)

        if (unsupportedApiList.length > 0) {
          reject(new Error('当前微信版本不支持扫码'))
          return
        }

        resolve()
      },
    })
  })
}

async function configureWechatJsSdk(jsApiList: string[]) {
  const pageUrl = getWechatScanSignatureUrl()

  if (!pageUrl) {
    throw new Error('当前环境不支持微信扫码')
  }

  const wx = await loadWechatJsSdkScript()
  const config = await requestWechatJsApiConfig(pageUrl)

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('微信扫码初始化超时')), wechatJsSdkReadyTimeoutMs)

    wx.ready(async () => {
      window.clearTimeout(timeout)

      try {
        await ensureWechatJsApiAvailable(wx, jsApiList)
        resolve()
      } catch (error) {
        reject(error)
      }
    })

    wx.error((error) => {
      window.clearTimeout(timeout)
      reject(new Error(normalizeWechatApiErrorMessage(error, '微信扫码初始化失败')))
    })

    wx.config({
      ...config,
      debug: false,
      jsApiList,
    })
  })

  return wx
}

export async function ensureWechatJsApiReady(jsApiList: string[] = [...defaultWechatJsApiList]) {
  if (!isWechatBrowser()) {
    throw new Error('请在微信内打开当前页面后扫码')
  }

  const cacheKey = getWechatScanConfigCacheKey(jsApiList)
  const cachedPromise = wechatJsSdkConfigPromiseCache.get(cacheKey)

  if (cachedPromise) {
    return cachedPromise
  }

  const nextPromise = configureWechatJsSdk(jsApiList).catch((error) => {
    wechatJsSdkConfigPromiseCache.delete(cacheKey)
    throw error
  })

  wechatJsSdkConfigPromiseCache.set(cacheKey, nextPromise)
  return nextPromise
}

export async function scanWechatQRCode() {
  const wx = await ensureWechatJsApiReady()

  return new Promise<string>((resolve, reject) => {
    wx.scanQRCode({
      fail: (error) => reject(new Error(normalizeWechatApiErrorMessage(error, '微信扫码失败'))),
      needResult: 1,
      scanType: ['qrCode', 'barCode'],
      success: (result) => resolve(typeof result.resultStr === 'string' ? result.resultStr.trim() : ''),
    })
  })
}
