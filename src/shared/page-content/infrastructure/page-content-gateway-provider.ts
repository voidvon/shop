import { inject, type App, type InjectionKey } from 'vue'

import type { PageContentGateway } from '../domain/page-content-gateway'

const pageContentGatewayKey: InjectionKey<PageContentGateway> = Symbol('page-content-gateway')

export function providePageContentGateway(app: App, gateway: PageContentGateway) {
  app.provide(pageContentGatewayKey, gateway)
}

export function usePageContentGateway() {
  const gateway = inject(pageContentGatewayKey)

  if (!gateway) {
    throw new Error('PageContentGateway is not available. Ensure provideBackendRuntime(app) runs during bootstrap.')
  }

  return gateway
}
