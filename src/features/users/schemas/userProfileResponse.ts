import type { UserProfile } from '@/shared/types'
import type { SearchUserItemReduced } from './searchUserSchema'

// GET /users/:id passou a devolver uma união discriminada por `kind` (correção
// de segurança F-08): conta privada vista por quem não é o dono nem follower
// ACCEPTED vem REDUZIDA — sem bio, contadores, eventos nem preferências.
//
// O backend afirma devolver "esse mesmo kind" da busca de usuários, então o
// card reduzido é exatamente o de /users/search. Reusamos SearchUserItemReduced
// em vez de duplicar a forma.
export type ReducedUserProfile = SearchUserItemReduced

export type FullUserProfile = UserProfile & { kind: 'full' }

export type UserProfileResponse = FullUserProfile | ReducedUserProfile

export function isReducedProfile(
  profile: UserProfileResponse,
): profile is ReducedUserProfile {
  return profile.kind === 'reduced'
}
