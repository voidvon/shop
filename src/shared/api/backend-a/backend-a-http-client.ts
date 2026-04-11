import {
  resolveBackendABaseUrl,
  resolveBackendATimeoutMs,
} from './backend-a-config'

type BackendAQueryValue = boolean | number | string | null | undefined
type BackendARequestBody = BodyInit | Record<string, unknown> | null | undefined

export interface BackendAQueryParams {
  [key: string]: BackendAQueryValue
}

interface BackendAEnvelope<T> {
  code?: number
  data?: T
  message?: string
}

interface BackendAHttpClientOptions {
  baseUrl?: string
  getAccessToken?: () => string | null
  timeoutMs?: number
}

interface BackendARequestOptions {
  body?: BackendARequestBody
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST'
  path: string
  query?: BackendAQueryParams
}

export class BackendAHttpError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'BackendAHttpError'
    this.status = status
  }
}

function createEndpointUrl(baseUrl: string, path: string, query?: BackendAQueryParams) {
  const url = new URL(path, `${baseUrl}/`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') {
        continue
      }

      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function createRequestHeaders(
  options: BackendAHttpClientOptions,
  body?: BackendARequestBody,
) {
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (body && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json')
  }

  const accessToken = options.getAccessToken?.()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return headers
}

function normalizeHttpErrorMessage(status: number, fallbackMessage: string) {
  if (status === 401) {
    return '登录状态已失效，请重新登录'
  }

  if (status === 403) {
    return '当前账号暂无访问权限'
  }

  if (status === 404) {
    return '请求的后端接口不存在'
  }

  if (status >= 500) {
    return '后端服务暂时不可用，请稍后再试'
  }

  return fallbackMessage
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (response.status !== 200) {
    let parsedValue: unknown = null

    if (text) {
      try {
        parsedValue = JSON.parse(text)
      } catch {
        parsedValue = null
      }
    }

    const envelope = parsedValue as BackendAEnvelope<T> | null

    throw new BackendAHttpError(
      normalizeHttpErrorMessage(
        response.status,
        envelope?.message ?? `请求失败(${response.status})`,
      ),
      response.status,
    )
  }

  if (!text) {
    throw new BackendAHttpError('后端接口返回为空', response.status)
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(text)
  } catch {
    throw new BackendAHttpError('后端接口返回格式无效', response.status)
  }

  if (
    !parsedValue
    || typeof parsedValue !== 'object'
    || !('code' in parsedValue)
    || typeof (parsedValue as BackendAEnvelope<T>).code !== 'number'
  ) {
    throw new BackendAHttpError('后端接口返回格式无效', response.status)
  }

  const envelope = parsedValue as BackendAEnvelope<T>

  if (envelope.code !== 0) {
    throw new BackendAHttpError(envelope.message ?? '后端接口返回失败', response.status)
  }

  return (envelope.data ?? parsedValue) as T
}

function normalizeRequestBody(body?: BackendARequestBody) {
  if (body === null || body === undefined) {
    return undefined
  }

  if (
    typeof body === 'string'
    || body instanceof Blob
    || body instanceof FormData
    || body instanceof URLSearchParams
    || body instanceof ArrayBuffer
    || ArrayBuffer.isView(body)
  ) {
    return body
  }

  return JSON.stringify(body)
}

export function createBackendAHttpClient(options: BackendAHttpClientOptions = {}) {
  const baseUrl = options.baseUrl ?? resolveBackendABaseUrl()
  const timeoutMs = options.timeoutMs ?? resolveBackendATimeoutMs()

  async function request<T>({ method, path, query, body }: BackendARequestOptions) {
    const controller = new AbortController()
    const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs)
    const normalizedBody = normalizeRequestBody(body)

    try {
      const response = await fetch(createEndpointUrl(baseUrl, path, query), {
        body: normalizedBody,
        headers: createRequestHeaders(options, body),
        method,
        signal: controller.signal,
      })

      return await parseResponseBody<T>(response)
    } catch (error) {
      if (error instanceof BackendAHttpError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('后端接口请求超时')
      }

      throw new Error('后端接口请求失败，请检查网络连接')
    } finally {
      globalThis.clearTimeout(timeout)
    }
  }

  return {
    async get<T>(path: string, query?: BackendAQueryParams) {
      return request<T>({
        method: 'GET',
        path,
        query,
      })
    },

    async post<T>(path: string, body?: BackendARequestBody, query?: BackendAQueryParams) {
      return request<T>({
        body,
        method: 'POST',
        path,
        query,
      })
    },

    async patch<T>(path: string, body?: BackendARequestBody, query?: BackendAQueryParams) {
      return request<T>({
        body,
        method: 'PATCH',
        path,
        query,
      })
    },

    async delete<T>(path: string, query?: BackendAQueryParams) {
      return request<T>({
        method: 'DELETE',
        path,
        query,
      })
    },
  }
}

export const backendAHttpClient = createBackendAHttpClient()
