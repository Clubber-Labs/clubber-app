import type { UserProfile } from '@/shared/types'

export type SocialProvider = 'google' | 'facebook'

export type SocialLoginPayload = {
  provider: SocialProvider
  token: string
}

export type SocialLoginResponse = {
  token: string
  refreshToken: string
  user: UserProfile
  profileIncomplete: boolean
}
