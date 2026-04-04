export const memberCardNumberLengthRange = {
  min: 12,
  max: 14,
} as const

export const memberCardSecretLengthRange = {
  min: 6,
  max: 8,
} as const

export function normalizeMemberCardNumber(value: string) {
  return value
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, memberCardNumberLengthRange.max)
}

export function normalizeMemberCardSecret(value: string) {
  return value
    .replace(/\s+/g, '')
    .slice(0, memberCardSecretLengthRange.max)
}

export function validateMemberCardNumber(value: string) {
  const normalized = normalizeMemberCardNumber(value)

  if (!normalized) {
    return '请输入卡券编号'
  }

  if (
    normalized.length < memberCardNumberLengthRange.min
    || normalized.length > memberCardNumberLengthRange.max
  ) {
    return `请输入${memberCardNumberLengthRange.min}-${memberCardNumberLengthRange.max}位卡券编号`
  }

  return null
}

export function validateMemberCardSecret(value: string) {
  const normalized = normalizeMemberCardSecret(value)

  if (!normalized) {
    return '请输入卡券卡密'
  }

  if (
    normalized.length < memberCardSecretLengthRange.min
    || normalized.length > memberCardSecretLengthRange.max
  ) {
    return `请输入${memberCardSecretLengthRange.min}-${memberCardSecretLengthRange.max}位卡券卡密`
  }

  return null
}
