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
}

export type FeedAttendee = {
  id: string
  name: string
  username: string
}

export type AttendanceType = 'INTERESTED' | 'CONFIRMED' | 'NOT_INTERESTED'

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
  latitude: number
  longitude: number
  address?: string
  category: string
  author: FeedAuthor
  attendances: FeedAttendee[]
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
  latitude: number
  longitude: number
  address?: string
  category: string
  isPublic: boolean
  imageUrl?: string
  maxCapacity?: number
  canceledAt?: string
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
