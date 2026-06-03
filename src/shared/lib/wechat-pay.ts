import { isWechatBrowser } from './wechat-browser'

export interface WechatJsapiPaymentPayload {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

interface WeixinJSBridgeApi {
  invoke(
    name: 'getBrandWCPayRequest',
    payload: WechatJsapiPaymentPayload,
    callback: (result: { err_msg?: string }) => void,
  ): void
}

declare global {
  interface Window {
    WeixinJSBridge?: WeixinJSBridgeApi
  }
}

const weixinBridgeReadyTimeoutMs = 5000

function waitForWeixinJSBridge() {
  return new Promise<WeixinJSBridgeApi>((resolve, reject) => {
    if (!isWechatBrowser()) {
      reject(new Error('请在微信内打开当前页面后充值'))
      return
    }

    if (window.WeixinJSBridge) {
      resolve(window.WeixinJSBridge)
      return
    }

    const timer = window.setTimeout(() => {
      reject(new Error('微信支付组件未就绪，请稍后重试'))
    }, weixinBridgeReadyTimeoutMs)

    document.addEventListener('WeixinJSBridgeReady', () => {
      window.clearTimeout(timer)

      if (window.WeixinJSBridge) {
        resolve(window.WeixinJSBridge)
        return
      }

      reject(new Error('微信支付组件不可用'))
    }, { once: true })
  })
}

export async function invokeWechatJsapiPayment(payment: WechatJsapiPaymentPayload) {
  const bridge = await waitForWeixinJSBridge()

  return new Promise<void>((resolve, reject) => {
    bridge.invoke('getBrandWCPayRequest', payment, (result) => {
      if (result.err_msg === 'get_brand_wcpay_request:ok') {
        resolve()
        return
      }

      if (result.err_msg === 'get_brand_wcpay_request:cancel') {
        reject(new Error('支付已取消'))
        return
      }

      reject(new Error(result.err_msg || '微信支付未完成'))
    })
  })
}
