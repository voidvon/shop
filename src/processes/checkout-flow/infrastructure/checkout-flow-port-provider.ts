import { inject, type App, type InjectionKey } from 'vue'

import type { CheckoutFlowPort } from '../domain/checkout-flow-port'

const checkoutFlowPortKey: InjectionKey<CheckoutFlowPort> = Symbol('checkout-flow-port')

export function provideCheckoutFlowPort(app: App, port: CheckoutFlowPort) {
  app.provide(checkoutFlowPortKey, port)
}

export function useCheckoutFlowPort() {
  const port = inject(checkoutFlowPortKey)

  if (!port) {
    throw new Error('CheckoutFlowPort is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return port
}
