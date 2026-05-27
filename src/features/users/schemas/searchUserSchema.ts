import type { FollowStatus } from '@/shared/types'

export type SearchUserItemFull = {
  kind: 'full'
  id: string
  username: string
  name: string
  lastname: string
  avatarUrl: string | null
  isPrivate: boolean
  bio: string | null
  followersCount: number
  followingCount: number
  createdAt: string
  followStatus: FollowStatus
}

export type SearchUserItemReduced = {
  kind: 'reduced'
  id: string
  username: string
  name: string
  lastname: string
  avatarUrl: string | null
  isPrivate: true
  followStatus: FollowStatus
}

export type SearchUserItem = SearchUserItemFull | SearchUserItemReduced

export function hasFullProfile(u: SearchUserItem): u is SearchUserItemFull {
  return u.kind === 'full'
}
