import type {
  AuthMerchantSupportedBalanceType,
  AuthResult,
  AuthSession,
  AuthUserInfo,
} from '@/shared/types/modules'

import type {
  BackendAUserProfileDto,
  BackendAWechatLoginDataDto,
} from '../dto/backend-a-member-auth.dto'

const backendADefaultCapabilities: AuthResult['capabilities'] = [
  'wechat-login',
  'wechat-scan-card',
  'recharge-card-payment',
  'payment-code',
]

const backendADefaultSecurity: AuthResult['security'] = {
  canResetPassword: false,
  hasBoundMobile: false,
  hasPaymentPassword: false,
}

function resolveBackendAUsername(profile: BackendAUserProfileDto) {
  const preferredName = profile.name.trim() || profile.nickname.trim()

  if (preferredName) {
    return preferredName
  }

  if (profile.mobile) {
    return `wx_${profile.mobile.slice(-4)}`
  }

  return `wx_user_${profile.id}`
}

function resolveBackendAMerchantId(profile: BackendAUserProfileDto) {
  const merchantId = profile.merchant?.id ?? profile.merchantId ?? profile.merchant_id ?? null

  if (typeof merchantId === 'string') {
    const normalizedMerchantId = merchantId.trim()
    return normalizedMerchantId || null
  }

  if (typeof merchantId === 'number' && Number.isFinite(merchantId)) {
    return String(merchantId)
  }

  return null
}

function resolveBackendAMerchantName(profile: BackendAUserProfileDto) {
  return normalizeString(profile.merchant?.name)
    ?? normalizeString(profile.merchant?.short_name)
    ?? null
}

function normalizeString(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()
  return normalizedValue || null
}

function normalizeStringLikeId(value: number | string | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return normalizeString(typeof value === 'string' ? value : null)
}

function resolveBackendAMerchantSupportedBalanceTypes(
  profile: BackendAUserProfileDto,
): AuthMerchantSupportedBalanceType[] {
  const rawBalanceTypes = profile.merchant?.supported_balance_types

  if (!Array.isArray(rawBalanceTypes)) {
    return []
  }

  const uniqueBalanceTypes = new Map<string, AuthMerchantSupportedBalanceType>()

  for (const balanceType of rawBalanceTypes) {
    const id = normalizeStringLikeId(balanceType?.id)

    if (!id || uniqueBalanceTypes.has(id)) {
      continue
    }

    uniqueBalanceTypes.set(id, {
      code: normalizeString(balanceType?.code),
      id,
      name: normalizeString(balanceType?.name) ?? `余额类型#${id}`,
    })
  }

  return Array.from(uniqueBalanceTypes.values())
}

export function mapBackendAUserProfileDto(profile: BackendAUserProfileDto): AuthUserInfo {
  return {
    avatarUrl: profile.avatar,
    email: null,
    merchantId: resolveBackendAMerchantId(profile),
    merchantName: resolveBackendAMerchantName(profile),
    merchantSupportedBalanceTypes: resolveBackendAMerchantSupportedBalanceTypes(profile),
    mobile: profile.mobile,
    nickname: profile.nickname.trim() || profile.name.trim() || null,
    userId: String(profile.id),
    username: resolveBackendAUsername(profile),
  }
}

export function mapBackendAUserProfileToAuthResult(
  profile: BackendAUserProfileDto,
  session: AuthSession,
  previousAuthResult?: AuthResult | null,
): AuthResult {
  return {
    capabilities: previousAuthResult?.capabilities ?? [...backendADefaultCapabilities],
    isNewUser: previousAuthResult?.isNewUser ?? false,
    security: {
      ...backendADefaultSecurity,
      ...previousAuthResult?.security,
      canResetPassword: false,
      hasBoundMobile: Boolean(profile.mobile),
    },
    session,
    userInfo: mapBackendAUserProfileDto(profile),
  }
}

export function mapBackendAWechatLoginDataDto(
  input: BackendAWechatLoginDataDto,
): AuthResult {
  return {
    ...mapBackendAUserProfileToAuthResult(input.user, {
      accessToken: input.token,
      expiresAt: null,
      refreshToken: null,
    }),
    isNewUser: input.is_new_user,
  }
}
