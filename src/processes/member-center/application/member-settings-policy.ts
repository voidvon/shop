import type { AuthResult } from '@/shared/types/modules'

import type { MemberSettingsItem } from '../domain/member-center-page-data'

export function canBindMemberMobileByWechat(authResult: AuthResult | null) {
  return authResult?.capabilities.includes('wechat-mobile-bind') === true
}

export function shouldShowMemberMobileSetting(authResult: AuthResult | null) {
  return canBindMemberMobileByWechat(authResult) || Boolean(authResult?.userInfo.mobile)
}

export function filterVisibleMemberSettings(
  items: MemberSettingsItem[],
  authResult: AuthResult | null,
) {
  return items.filter((item) => item.key !== 'mobile' || shouldShowMemberMobileSetting(authResult))
}
