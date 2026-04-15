import type { MemberAuthSession } from '@/entities/member-auth'
import { notifyBackendAUnauthorized } from '@/shared/api/backend-a/backend-a-http-client'
import {
  resolveBackendAMemberAssetsBaseUrl,
  resolveBackendAMemberAssetsTimeoutMs,
} from './backend-a-member-assets-config'
import type {
  BackendABindMemberCardRequestDto,
  BackendABindMemberCardResponseDto,
  BackendAMemberAssetsGateway,
  BackendAMemberAssetsSnapshotDto,
  BackendASpendBalanceRequestDto,
  BackendASpendBalanceResponseDto,
} from './backend-a-member-assets-gateway'

interface BackendAEnvelope<T> {
  data?: T
  error?: {
    code?: string
    message?: string
  }
  message?: string
}

interface BackendAMemberAssetsHttpGatewayOptions {
  baseUrl: string
  getAccessToken: () => string | null
  getMemberId: () => string | null
  onUnauthorized?: () => void | Promise<void>
  timeoutMs?: number
}

class BackendAMemberAssetsHttpError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'BackendAMemberAssetsHttpError'
    this.status = status
  }
}

function createRequestHeaders(options: BackendAMemberAssetsHttpGatewayOptions) {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  })

  const accessToken = options.getAccessToken()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const memberId = options.getMemberId()
  if (memberId) {
    headers.set('X-Member-Id', memberId)
  }

  return headers
}

function createEndpointUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function normalizeHttpErrorMessage(status: number, fallbackMessage: string) {
  if (status === 401) {
    return '登录状态已失效，请重新登录'
  }

  if (status === 403) {
    return '当前账号暂无会员资产操作权限'
  }

  if (status === 404) {
    return '会员资产接口暂未开通'
  }

  if (status >= 500) {
    return '会员资产服务暂时不可用，请稍后再试'
  }

  return fallbackMessage
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text) {
    throw new BackendAMemberAssetsHttpError('会员资产接口返回为空', response.status)
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(text)
  } catch {
    throw new BackendAMemberAssetsHttpError('会员资产接口返回格式无效', response.status)
  }

  if (!response.ok) {
    const envelope = parsedValue as BackendAEnvelope<unknown>
    const message = envelope.error?.message ?? envelope.message ?? `请求失败(${response.status})`
    throw new BackendAMemberAssetsHttpError(
      normalizeHttpErrorMessage(response.status, message),
      response.status,
    )
  }

  const envelope = parsedValue as BackendAEnvelope<T>
  return (envelope.data ?? parsedValue) as T
}

async function requestBackendAMemberAssets<T>(
  options: BackendAMemberAssetsHttpGatewayOptions,
  path: string,
  init: RequestInit,
) {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), options.timeoutMs ?? 8000)

  try {
    const response = await fetch(createEndpointUrl(options.baseUrl, path), {
      ...init,
      headers: createRequestHeaders(options),
      signal: controller.signal,
    })

    return await parseResponseBody<T>(response)
  } catch (error) {
    if (error instanceof BackendAMemberAssetsHttpError) {
      if (error.status === 401 && options.getAccessToken()) {
        await options.onUnauthorized?.()
      }

      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('会员资产接口请求超时')
    }

    throw new Error('会员资产接口请求失败，请检查网络连接')
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

export function createBackendAMemberAssetsHttpGateway(
  options: BackendAMemberAssetsHttpGatewayOptions,
): BackendAMemberAssetsGateway {
  return {
    async bindMemberCard(dto: BackendABindMemberCardRequestDto): Promise<BackendABindMemberCardResponseDto> {
      return requestBackendAMemberAssets<BackendABindMemberCardResponseDto>(
        options,
        '/member/assets/cards/bind',
        {
          body: JSON.stringify(dto),
          method: 'POST',
        },
      )
    },

    async getSnapshot(): Promise<BackendAMemberAssetsSnapshotDto> {
      return requestBackendAMemberAssets<BackendAMemberAssetsSnapshotDto>(
        options,
        '/member/assets/snapshot',
        {
          method: 'GET',
        },
      )
    },

    async spendBalance(dto: BackendASpendBalanceRequestDto): Promise<BackendASpendBalanceResponseDto> {
      return requestBackendAMemberAssets<BackendASpendBalanceResponseDto>(
        options,
        '/member/assets/balance/spend',
        {
          body: JSON.stringify(dto),
          method: 'POST',
        },
      )
    },
  }
}

export function createBackendAMemberAssetsGatewayFromEnv(
  memberAuthSession: MemberAuthSession,
): BackendAMemberAssetsGateway | null {
  const baseUrl = resolveBackendAMemberAssetsBaseUrl()

  if (!baseUrl) {
    return null
  }

  return createBackendAMemberAssetsHttpGateway({
    baseUrl,
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
    getMemberId: () => memberAuthSession.getSnapshot().authResult?.userInfo.userId ?? null,
    onUnauthorized: notifyBackendAUnauthorized,
    timeoutMs: resolveBackendAMemberAssetsTimeoutMs(),
  })
}
