import type { AuthResult } from '@/shared/types/modules'

import type {
  MemberLoginCommand,
  MemberMobileRegisterCommand,
  MemberRegisterCommand,
  MemberRegisterSmsCodeCommand,
  MemberRegisterSmsCodeResult,
} from './member-auth'

export interface MemberAuthRepository {
  login(command: MemberLoginCommand): Promise<AuthResult>
  registerByAccount(command: MemberRegisterCommand): Promise<AuthResult>
  registerByMobile(command: MemberMobileRegisterCommand): Promise<AuthResult>
  requestRegisterSmsCode(
    command: MemberRegisterSmsCodeCommand,
  ): Promise<MemberRegisterSmsCodeResult>
}
