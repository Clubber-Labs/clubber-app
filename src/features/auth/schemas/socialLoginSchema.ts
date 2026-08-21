import type { UserProfile } from '@/shared/types'

export type SocialProvider = 'google' | 'apple'

export type SocialFullName = {
  givenName: string | null
  familyName: string | null
}

export type SocialLoginPayload = {
  provider: SocialProvider
  token: string
  // Só no fluxo Apple, e só quando a Apple entrega o nome (1º consentimento).
  fullName?: SocialFullName
}

export type SocialLoginResponse = {
  token: string
  refreshToken: string
  user: UserProfile
  profileIncomplete: boolean
}
