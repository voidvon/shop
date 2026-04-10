import type { MemberAuthSession } from '@/entities/member-auth'
import {
  createBackendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'
import { resolveBackendAMediaUrl } from '@/shared/api/backend-a/backend-a-config'

import type {
  MerchantDeductionScanResult,
  MerchantDeductionService,
  MerchantDeductionSubmitCommand,
  MerchantDeductionSubmitResult,
  MerchantDeductionSummaryRow,
  MerchantDeductionUploadedImage,
} from '../../../domain/merchant-deduction-service'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeString(value: unknown) {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim()

    if (!normalizedValue) {
      return null
    }

    const parsedValue = Number(normalizedValue)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }

  return null
}

function findNestedStringByPredicate(
  input: unknown,
  predicate: (key: string, value: string) => boolean,
  depth = 0,
): string | null {
  if (depth > 5 || input === null || input === undefined) {
    return null
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const matchedValue = findNestedStringByPredicate(item, predicate, depth + 1)

      if (matchedValue) {
        return matchedValue
      }
    }

    return null
  }

  if (!isRecord(input)) {
    return null
  }

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const normalizedValue = normalizeString(rawValue)

    if (normalizedValue && predicate(rawKey.toLowerCase(), normalizedValue)) {
      return normalizedValue
    }
  }

  for (const rawValue of Object.values(input)) {
    const matchedValue = findNestedStringByPredicate(rawValue, predicate, depth + 1)

    if (matchedValue) {
      return matchedValue
    }
  }

  return null
}

function findNestedNumberByKey(input: unknown, candidateKeys: string[], depth = 0): number | null {
  if (depth > 5 || input === null || input === undefined) {
    return null
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const matchedValue = findNestedNumberByKey(item, candidateKeys, depth + 1)

      if (matchedValue !== null) {
        return matchedValue
      }
    }

    return null
  }

  if (!isRecord(input)) {
    return null
  }

  for (const [rawKey, rawValue] of Object.entries(input)) {
    if (candidateKeys.includes(rawKey.toLowerCase())) {
      const normalizedValue = normalizeNumber(rawValue)

      if (normalizedValue !== null) {
        return normalizedValue
      }
    }
  }

  for (const rawValue of Object.values(input)) {
    const matchedValue = findNestedNumberByKey(rawValue, candidateKeys, depth + 1)

    if (matchedValue !== null) {
      return matchedValue
    }
  }

  return null
}

function collectKnownRecords(source: JsonRecord) {
  const records = [source]

  for (const key of [
    'account',
    'balanceAccount',
    'balance_account',
    'balanceType',
    'balance_type',
    'card',
    'member',
    'merchant',
    'payer',
    'payment',
    'storedValueCard',
    'stored_value_card',
    'user',
  ]) {
    const record = source[key]

    if (isRecord(record)) {
      records.push(record)
    }
  }

  return records
}

function pickString(records: JsonRecord[], candidateKeys: string[]) {
  for (const record of records) {
    for (const candidateKey of candidateKeys) {
      const normalizedValue = normalizeString(record[candidateKey])

      if (normalizedValue) {
        return normalizedValue
      }
    }
  }

  return null
}

function buildSummaryRows(
  rawPayload: JsonRecord | null,
  fallbackPaymentToken: string | null,
  fallbackCardQrContent: string | null,
): MerchantDeductionSummaryRow[] {
  const rows: MerchantDeductionSummaryRow[] = []

  if (!rawPayload) {
    if (fallbackPaymentToken) {
      return [{ label: '付款码', value: fallbackPaymentToken }]
    }

    if (fallbackCardQrContent) {
      return [{ label: '二维码内容', value: fallbackCardQrContent }]
    }

    return rows
  }

  const records = collectKnownRecords(rawPayload)
  const candidates: Array<[string, string | null]> = [
    ['用户', pickString(records, ['payer_name', 'member_name', 'user_name', 'nickname', 'name'])],
    ['手机号', pickString(records, ['payer_mobile', 'mobile', 'phone'])],
    ['余额类型', pickString(records, ['balance_type_name', 'balanceTypeName', 'name'])],
    ['卡号', pickString(records, ['card_number', 'cardNumber', 'card_no'])],
    ['付款码', pickString(records, ['payment_token', 'paymentToken']) ?? fallbackPaymentToken],
    ['商户', pickString(records, ['merchant_name', 'merchantName', 'name'])],
    ['状态', pickString(records, ['status_text', 'statusText', 'status'])],
  ]

  const seen = new Set<string>()

  for (const [label, value] of candidates) {
    if (!value) {
      continue
    }

    const dedupeKey = `${label}:${value}`

    if (seen.has(dedupeKey)) {
      continue
    }

    seen.add(dedupeKey)
    rows.push({ label, value })
  }

  if (rows.length === 0 && fallbackCardQrContent) {
    rows.push({ label: '二维码内容', value: fallbackCardQrContent })
  }

  return rows
}

function normalizeScannerPrefixedValue(rawCode: string) {
  const trimmedValue = rawCode.trim()

  if (!trimmedValue) {
    return ''
  }

  if (!trimmedValue.includes(',')) {
    return trimmedValue
  }

  const [prefix = '', ...restParts] = trimmedValue.split(',')
  const restValue = restParts.join(',').trim()

  if (/^[A-Z0-9_]+$/i.test(prefix.trim()) && restValue) {
    return restValue
  }

  return trimmedValue
}

function extractStructuredScanFields(rawCode: string) {
  const normalizedRawCode = normalizeScannerPrefixedValue(rawCode)
  const keyValueMatcher = /([a-zA-Z_]+)\s*[:=]\s*([^,&\s]+)/g

  const parseObject = (input: Record<string, unknown>) => ({
    cardQrContent: normalizeString(input.card_qr_content ?? input.cardQrContent),
    paymentToken: normalizeString(input.payment_token ?? input.paymentToken),
  })

  try {
    const parsedValue = JSON.parse(normalizedRawCode)

    if (isRecord(parsedValue)) {
      const resolved = parseObject(parsedValue)

      if (resolved.paymentToken || resolved.cardQrContent) {
        return resolved
      }
    }
  } catch {
    // Ignore JSON parse failures.
  }

  try {
    const parsedUrl = new URL(normalizedRawCode)
    const searchEntries = Object.fromEntries(parsedUrl.searchParams.entries())
    const hashEntries = parsedUrl.hash.startsWith('#')
      ? Object.fromEntries(new URLSearchParams(parsedUrl.hash.slice(1)).entries())
      : {}
    const resolved = parseObject({
      ...searchEntries,
      ...hashEntries,
    })

    if (resolved.paymentToken || resolved.cardQrContent) {
      return resolved
    }
  } catch {
    // Ignore invalid URLs.
  }

  if (normalizedRawCode.includes('=')) {
    const parsedQuery = Object.fromEntries(new URLSearchParams(normalizedRawCode).entries())
    const resolved = parseObject(parsedQuery)

    if (resolved.paymentToken || resolved.cardQrContent) {
      return resolved
    }
  }

  const keyValueEntries = Array.from(normalizedRawCode.matchAll(keyValueMatcher))

  if (keyValueEntries.length > 0) {
    const resolved = parseObject(Object.fromEntries(
      keyValueEntries.map((entry) => [entry[1], entry[2]]),
    ))

    if (resolved.paymentToken || resolved.cardQrContent) {
      return resolved
    }
  }

  if (/^[A-Z0-9_-]{8,}$/i.test(normalizedRawCode)) {
    return {
      cardQrContent: null,
      paymentToken: normalizedRawCode,
    }
  }

  return {
    cardQrContent: normalizedRawCode,
    paymentToken: null,
  }
}

function createScanRequestPayload(rawCode: string) {
  const normalizedRawCode = rawCode.trim()

  if (!normalizedRawCode) {
    throw new Error('未读取到付款码')
  }

  const structuredFields = extractStructuredScanFields(normalizedRawCode)

  if (structuredFields.paymentToken) {
    return {
      cardQrContent: null,
      paymentToken: structuredFields.paymentToken,
      requestBody: {
        payment_token: structuredFields.paymentToken,
      },
    }
  }

  if (!structuredFields.cardQrContent) {
    throw new Error('未识别到可用的付款码内容')
  }

  return {
    cardQrContent: structuredFields.cardQrContent,
    paymentToken: null,
    requestBody: {
      card_qr_content: structuredFields.cardQrContent,
    },
  }
}

function mapScanResult(
  rawCode: string,
  fallbackPaymentToken: string | null,
  fallbackCardQrContent: string | null,
  response: unknown,
): MerchantDeductionScanResult {
  const rawPayload = isRecord(response) ? response : null
  const records = rawPayload ? collectKnownRecords(rawPayload) : []

  const paymentToken = rawPayload
    ? pickString(records, ['payment_token', 'paymentToken']) ?? fallbackPaymentToken
    : fallbackPaymentToken
  const cardQrContent = rawPayload
    ? pickString(records, ['card_qr_content', 'cardQrContent']) ?? fallbackCardQrContent
    : fallbackCardQrContent

  return {
    balanceTypeId: rawPayload
      ? pickString(records, ['balance_type_id', 'balanceTypeId'])
      : null,
    balanceTypeName: rawPayload
      ? pickString(records, ['balance_type_name', 'balanceTypeName', 'name'])
      : null,
    cardNumber: rawPayload
      ? pickString(records, ['card_number', 'cardNumber', 'card_no'])
      : null,
    cardQrContent,
    payerMobile: rawPayload
      ? pickString(records, ['payer_mobile', 'mobile', 'phone'])
      : null,
    payerName: rawPayload
      ? pickString(records, ['payer_name', 'member_name', 'user_name', 'nickname', 'name'])
      : null,
    paymentToken,
    rawCode,
    summaryRows: buildSummaryRows(rawPayload, paymentToken, cardQrContent),
  }
}

function mapUploadedImage(file: File, response: unknown): MerchantDeductionUploadedImage {
  const path = findNestedStringByPredicate(response, (key, value) => {
    if (!key.includes('path')) {
      return false
    }

    return value.includes('/') || value.startsWith('uploads/')
  })
  const url = findNestedStringByPredicate(response, (key) => key.includes('url') || key === 'image')
  const resolvedPath = path ?? url

  if (!resolvedPath) {
    throw new Error('图片上传成功，但未返回可用地址')
  }

  return {
    disk: findNestedStringByPredicate(response, (key) => key === 'disk'),
    mimeType: findNestedStringByPredicate(response, (key) => key === 'mime_type' || key === 'mimetype' || key === 'mimeType')
      ?? file.type
      ?? null,
    name: file.name,
    path: resolvedPath,
    previewUrl: resolveBackendAMediaUrl(url ?? resolvedPath) ?? (url ?? resolvedPath),
    size: findNestedNumberByKey(response, ['size']) ?? file.size,
  }
}

function normalizeSubmitAmount(amount: number) {
  const normalizedAmount = Number(amount)

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error('请输入正确的扣款金额')
  }

  return Math.round(normalizedAmount * 100) / 100
}

function normalizeMerchantId(value: string) {
  const merchantId = Number.parseInt(value.trim(), 10)

  if (!Number.isFinite(merchantId) || merchantId <= 0) {
    throw new Error('当前账号未返回可用的商户 ID')
  }

  return merchantId
}

function normalizeOptionalInteger(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const normalizedValue = Number.parseInt(value.trim(), 10)
  return Number.isFinite(normalizedValue) && normalizedValue > 0 ? normalizedValue : null
}

function createDeductionIdempotencyKey(command: MerchantDeductionSubmitCommand) {
  return [
    'merchant-deduction',
    command.merchantId.trim(),
    Date.now(),
    Math.random().toString(36).slice(2, 10),
  ].join('-')
}

function mapSubmitResult(response: unknown): MerchantDeductionSubmitResult {
  const rawPayload = isRecord(response) ? response : null

  return {
    rawPayload,
    successMessage: normalizeString(rawPayload?.message) ?? '扣款成功',
  }
}

export function createBackendAMerchantDeductionService(
  memberAuthSession: MemberAuthSession,
): MerchantDeductionService {
  const httpClient = createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })

  return {
    async scanCode(rawCode: string) {
      const scanPayload = createScanRequestPayload(rawCode)
      const response = await httpClient.post<unknown>(
        '/api/v1/merchant/offline-payments/scan',
        scanPayload.requestBody,
      )

      return mapScanResult(rawCode, scanPayload.paymentToken, scanPayload.cardQrContent, response)
    },

    async submitDeduction(command: MerchantDeductionSubmitCommand) {
      const merchantId = normalizeMerchantId(command.merchantId)
      const amount = normalizeSubmitAmount(command.amount)
      const paymentToken = normalizeString(command.paymentToken)
      const cardQrContent = normalizeString(command.cardQrContent)

      if (!paymentToken && !cardQrContent) {
        throw new Error('请先扫描付款码')
      }

      const response = await httpClient.post<unknown>(
        '/api/v1/merchant/offline-payments/pay',
        {
          ...(paymentToken ? { payment_token: paymentToken } : {}),
          ...(cardQrContent ? { card_qr_content: cardQrContent } : {}),
          ...(normalizeOptionalInteger(command.balanceTypeId) ? { balance_type_id: normalizeOptionalInteger(command.balanceTypeId) } : {}),
          ...(normalizeString(command.remark) ? { remark: normalizeString(command.remark) } : {}),
          ...(command.attachments.length > 0
            ? {
                attachments: command.attachments.map((attachment) => ({
                  ...(attachment.disk ? { disk: attachment.disk } : {}),
                  ...(attachment.mimeType ? { mime_type: attachment.mimeType } : {}),
                  path: attachment.path,
                  ...(attachment.size ? { size: attachment.size } : {}),
                })),
              }
            : {}),
          amount,
          idempotency_key: createDeductionIdempotencyKey(command),
          merchant_id: merchantId,
        },
      )

      return mapSubmitResult(response)
    },

    async uploadImage(file: File) {
      const formData = new FormData()
      formData.append('image', file)

      const response = await httpClient.post<unknown>('/api/v1/uploads/images', formData)
      return mapUploadedImage(file, response)
    },
  }
}
