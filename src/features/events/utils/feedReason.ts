import type { FeedEvent } from '@/shared/types'

export type FeedReason =
  | { kind: 'self_created' }
  | { kind: 'friend_created'; name: string }
  | { kind: 'friend_attending'; name: string; others: number }
  | { kind: 'friend_commented'; name: string }

export function computeFeedReason(
  event: FeedEvent,
  viewerId: string | null,
): FeedReason | null {
  if (viewerId && event.author.id === viewerId) {
    return { kind: 'self_created' }
  }

  if (event.friendAttendances.length > 0) {
    const [first, ...rest] = event.friendAttendances
    return {
      kind: 'friend_attending',
      name: first.user.name,
      others: rest.length,
    }
  }

  if (event.recentComments.length > 0) {
    const friendComment = event.recentComments[0]
    return {
      kind: 'friend_commented',
      name: friendComment.author.name,
    }
  }

  return { kind: 'friend_created', name: event.author.name }
}
