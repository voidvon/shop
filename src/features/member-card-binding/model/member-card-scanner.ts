import {
  memberCardNumberLengthRange,
  memberCardSecretLengthRange,
  normalizeMemberCardNumber,
  normalizeMemberCardSecret,
} from '@/processes/member-center/domain/member-card-bind-rules'
import { ensureWechatJsApiReady, scanWechatQRCode } from '@/shared/lib/wechat-js-sdk'

export interface MemberCardScanResult {
  cardNumber: string
  cardSecret: string
  rawValue: string
}

const memberCardNumberKeys = ['cardNumber', 'cardNo', 'card_no', 'number', 'no', 'code'] as const
const memberCardSecretKeys = ['cardSecret', 'card_secret', 'secret', 'pwd', 'password'] as const

function isValidMemberCardNumber(value: string) {
  return (
    value.length >= memberCardNumberLengthRange.min
    && value.length <= memberCardNumberLengthRange.max
    && /^[0-9A-Z]+$/.test(value)
  )
}

function isValidMemberCardSecret(value: string) {
  return (
    value.length >= memberCardSecretLengthRange.min
    && value.length <= memberCardSecretLengthRange.max
  )
}

function normalizeScannedMemberCardNumber(value: string | null | undefined) {
  const normalized = normalizeMemberCardNumber(value ?? '')
  return isValidMemberCardNumber(normalized) ? normalized : ''
}

function normalizeScannedMemberCardSecret(value: string | null | undefined) {
  const normalized = normalizeMemberCardSecret(value ?? '')
  return isValidMemberCardSecret(normalized) ? normalized : ''
}

function createMemberCardScanResult(rawValue: string, cardNumber: string, cardSecret = '') {
  return {
    cardNumber,
    cardSecret,
    rawValue,
  }
}

function resolveFirstMatchedValue(
  input: Record<string, unknown>,
  candidateKeys: readonly string[],
  normalizer: (value: string | null | undefined) => string,
) {
  for (const key of candidateKeys) {
    const normalized = normalizer(typeof input[key] === 'string' ? input[key] : null)

    if (normalized) {
      return normalized
    }
  }

  return ''
}

function parseScanResultFromObject(rawValue: string, input: Record<string, unknown>) {
  const cardNumber = resolveFirstMatchedValue(input, memberCardNumberKeys, normalizeScannedMemberCardNumber)
  const cardSecret = resolveFirstMatchedValue(input, memberCardSecretKeys, normalizeScannedMemberCardSecret)

  return cardNumber ? createMemberCardScanResult(rawValue, cardNumber, cardSecret) : null
}

function tryParseMemberCardUrl(rawValue: string) {
  try {
    const url = new URL(rawValue)
    const input = Object.fromEntries(url.searchParams.entries())

    if (url.hash.startsWith('#')) {
      const hashParams = new URLSearchParams(url.hash.slice(1))

      for (const [key, value] of hashParams.entries()) {
        if (!(key in input)) {
          input[key] = value
        }
      }
    }

    return parseScanResultFromObject(rawValue, input)
  } catch {
    return null
  }
}

function tryParseMemberCardQueryString(rawValue: string) {
  if (!rawValue.includes('=')) {
    return null
  }

  return parseScanResultFromObject(rawValue, Object.fromEntries(new URLSearchParams(rawValue).entries()))
}

function tryParseMemberCardJson(rawValue: string) {
  try {
    const parsedValue = JSON.parse(rawValue)

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return null
    }

    return parseScanResultFromObject(rawValue, parsedValue as Record<string, unknown>)
  } catch {
    return null
  }
}

function tryParseMemberCardKeyValueText(rawValue: string) {
  const matches = Array.from(rawValue.matchAll(/([a-zA-Z_]+)\s*[:=]\s*([0-9a-zA-Z]+)/g))

  if (matches.length === 0) {
    return null
  }

  return parseScanResultFromObject(rawValue, Object.fromEntries(matches.map((match) => [match[1], match[2]])))
}

function tryParseMemberCardTokenText(rawValue: string) {
  const cleanedValue = rawValue.replace(/^[A-Z_]+,/, '')
  const tokens = cleanedValue
    .split(/[^0-9a-zA-Z]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const cardNumber = tokens
    .map(normalizeScannedMemberCardNumber)
    .find(Boolean)

  if (!cardNumber) {
    return null
  }

  const cardSecret = tokens
    .filter((token) => normalizeScannedMemberCardNumber(token) !== cardNumber)
    .map(normalizeScannedMemberCardSecret)
    .find(Boolean)

  return createMemberCardScanResult(rawValue, cardNumber, cardSecret ?? '')
}

export function parseMemberCardScanResult(rawValue: string) {
  const trimmedValue = rawValue.trim()

  if (!trimmedValue) {
    throw new Error('未读取到扫码结果')
  }

  const parsedResult = tryParseMemberCardJson(trimmedValue)
    ?? tryParseMemberCardUrl(trimmedValue)
    ?? tryParseMemberCardQueryString(trimmedValue)
    ?? tryParseMemberCardKeyValueText(trimmedValue)
    ?? tryParseMemberCardTokenText(trimmedValue)

  if (!parsedResult?.cardNumber) {
    throw new Error('未识别到卡券编号，请改为手动输入')
  }

  return parsedResult
}

export async function prepareMemberCardScanByWechat() {
  await ensureWechatJsApiReady()
}

export async function scanMemberCardByWechat() {
  const rawValue = await scanWechatQRCode()
  return parseMemberCardScanResult(rawValue)
}
