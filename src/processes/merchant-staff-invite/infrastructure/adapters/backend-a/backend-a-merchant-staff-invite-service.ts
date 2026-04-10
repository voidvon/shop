import type { MemberAuthSession } from '@/entities/member-auth'
import {
  BackendAHttpError,
  createBackendAHttpClient,
} from '@/shared/api/backend-a/backend-a-http-client'

import type {
  MerchantStaffBindResult,
  MerchantStaffInviteInfo,
  MerchantStaffInviteService,
} from '../../../domain/merchant-staff-invite-service'

type BackendAMerchantStaffInviteDto = Record<string, unknown>
type BackendAEnvelopeLike = Record<string, unknown>

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function asReadableString(value: unknown) {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized ? normalized : null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function pickString(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = asReadableString(source[key])

    if (value) {
      return value
    }
  }

  return null
}

function normalizeInviteToken(token: string) {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    throw new Error('缺少邀请标识')
  }

  return normalizedToken
}

function mapBackendAMerchantStaffInviteInfo(
  token: string,
  source: BackendAMerchantStaffInviteDto,
): MerchantStaffInviteInfo {
  const merchant = asRecord(source.merchant)
  const inviter = asRecord(source.inviter)
  const staff = asRecord(source.staff)

  return {
    expiresAt: pickString(
      source,
      'expires_at',
      'expire_at',
      'expired_at',
      'expiration_time',
      'expirationTime',
    ),
    inviterName: pickString(
      source,
      'inviter_name',
      'inviter_nickname',
      'inviterName',
      'inviterNickname',
    )
      ?? (inviter ? pickString(inviter, 'nickname', 'name', 'username') : null),
    merchantId: pickString(source, 'merchant_id', 'merchantId')
      ?? (merchant ? pickString(merchant, 'id', 'merchant_id', 'merchantId') : null),
    merchantName: pickString(source, 'merchant_name', 'merchantName')
      ?? (merchant ? pickString(merchant, 'name', 'merchant_name', 'merchantName') : null),
    roleName: pickString(
      source,
      'role_name',
      'roleName',
      'staff_role_name',
      'staffRoleName',
      'position_name',
      'positionName',
    )
      ?? (staff ? pickString(staff, 'role_name', 'roleName', 'position_name', 'positionName') : null),
    statusText: pickString(source, 'status_text', 'statusText', 'status', 'invite_status', 'inviteStatus'),
    token,
  }
}

function resolveBindSuccessMessage(response: unknown) {
  const record = asRecord(response)
  const message = record ? pickString(record, 'message') : null
  return message ?? '员工绑定成功'
}

export function createBackendAMerchantStaffInviteService(
  memberAuthSession: MemberAuthSession,
): MerchantStaffInviteService {
  const publicHttpClient = createBackendAHttpClient()
  const authedHttpClient = createBackendAHttpClient({
    getAccessToken: () => memberAuthSession.getSnapshot().authResult?.session.accessToken ?? null,
  })

  return {
    async bindInviteByToken(token: string): Promise<MerchantStaffBindResult> {
      const normalizedToken = normalizeInviteToken(token)

      try {
        const response = await authedHttpClient.post<BackendAEnvelopeLike>(
          `/api/v1/merchant-staff-invites/${encodeURIComponent(normalizedToken)}/bind`,
        )

        return {
          successMessage: resolveBindSuccessMessage(response),
        }
      } catch (error) {
        if (error instanceof BackendAHttpError && error.status === 404) {
          throw new Error('邀请链接不存在或已失效')
        }

        throw error
      }
    },

    async getInviteByToken(token: string): Promise<MerchantStaffInviteInfo> {
      const normalizedToken = normalizeInviteToken(token)

      try {
        const response = await publicHttpClient.get<BackendAMerchantStaffInviteDto>(
          `/api/v1/merchant-staff-invites/${encodeURIComponent(normalizedToken)}`,
        )

        return mapBackendAMerchantStaffInviteInfo(normalizedToken, response)
      } catch (error) {
        if (error instanceof BackendAHttpError && error.status === 404) {
          throw new Error('邀请链接不存在或已失效')
        }

        throw error
      }
    },
  }
}
