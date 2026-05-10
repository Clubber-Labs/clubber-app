export type ApiError = {
  message: string
  statusCode: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type CursorPaginatedResponse<T> = {
  data: T[]
  nextCursor: string | null
}

export type FeedAuthor = {
  id: string
  name: string
  lastname: string
  username: string
  avatarUrl?: string | null
}

export type FriendAttendance = {
  user: FeedAuthor
}

export type AttendanceType = 'INTERESTED' | 'CONFIRMED' | 'NOT_INTERESTED'

/**
 * Ciclo de vida do evento, computado pelo backend a cada request.
 * NUNCA calcular no client.
 */
export type EventStatus =
  | 'UPCOMING'
  | 'SOON'
  | 'ONGOING'
  | 'PAST'
  | 'CANCELED'

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'

export type CommentAuthor = FeedAuthor

export type EventComment = {
  id: string
  content: string
  createdAt: string
  authorId: string
  author: CommentAuthor
}

export type FeedEvent = {
  id: string
  title: string
  description?: string
  imageUrl?: string
  isPublic: boolean
  createdAt: string
  date: string
  endDate?: string | null
  status?: EventStatus | null
  canceledAt?: string | null
  latitude: number
  longitude: number
  address?: string
  category: string
  author: FeedAuthor
  // /feed inclui friendAttendances (personalizado); /events não retorna esse
  // campo. Mantido optional pra refletir o contrato real da API.
  friendAttendances?: FriendAttendance[]
  recentComments: EventComment[]
  userReaction: ReactionType | null
  userAttendance: AttendanceType | null
  _count: {
    attendances: number
    comments: number
    reactions: number
  }
}

export type EventDetail = {
  id: string
  title: string
  description: string
  date: string
  endDate?: string | null
  status?: EventStatus | null
  latitude: number
  longitude: number
  address?: string
  category: string
  isPublic: boolean
  imageUrl?: string
  maxCapacity?: number
  canceledAt?: string | null
  createdAt: string
  updatedAt: string
  authorId: string
  author: FeedAuthor
  userReaction: ReactionType | null
  userAttendance: AttendanceType | null
  _count: {
    attendances: number
    reactions: number
    comments: number
  }
}

export type Attendance = {
  type: AttendanceType
  userId: string
  eventId: string
  createdAt: string
}

export type Reaction = {
  type: ReactionType
  userId: string
  eventId: string
  createdAt: string
}

export type EventPost = {
  id: string
  content: string
  createdAt: string
  authorId: string
  eventId: string
  author: CommentAuthor
  _count?: {
    comments: number
    reactions: number
  }
}

export type FollowStatus = 'PENDING' | 'ACCEPTED' | null

export type UserProfile = {
  id: string
  name: string
  lastname: string
  username: string
  bio?: string | null
  avatarUrl?: string | null
  isPrivate: boolean
  birthdate?: string
  phone?: string
  email?: string
  createdAt: string
  followStatus?: FollowStatus
  eventsCount: number
  followersCount: number
  followingCount: number
}

export type UserEventSummary = {
  id: string
  title: string
  date: string
  category: string
  imageUrl?: string | null
  address?: string | null
  isPublic: boolean
  attendancesCount?: number
}
