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

// Shape mínimo de usuário usado pelo chat (sender, participants[].user, blocked).
// Idêntico ao FeedAuthor; nome canônico do contrato de mensageria.
export type UserMini = {
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
export type EventStatus = 'UPCOMING' | 'SOON' | 'ONGOING' | 'PAST' | 'CANCELED'

export type FeedReason =
  | { kind: 'self_created' }
  | { kind: 'self_interaction' }
  | { kind: 'friend_created'; user: FeedAuthor }
  | {
      kind: 'friend_attending'
      user: FeedAuthor
      type: 'CONFIRMED' | 'INTERESTED'
    }
  | { kind: 'friend_reacted'; user: FeedAuthor }
  | { kind: 'friend_commented'; user: FeedAuthor; preview: string }
  // Sem laço social: veio da descoberta (categoria preferida e/ou proximidade).
  | { kind: 'discovery' }

/**
 * Categoria de evento servida por GET /categories. `value` é o identificador
 * canônico do enum (MAIÚSCULAS, estável) que vai/volta da API; `label` é o
 * rótulo traduzido apenas para exibição. Fonte única de rótulos — nunca
 * hardcodar labels no app.
 */
export type Category = {
  value: string
  label: string
}

export type CategoriesResponse = {
  locale: string
  data: Category[]
}

export type CommentAuthor = FeedAuthor

export type EventComment = {
  id: string
  content: string
  createdAt: string
  authorId: string
  author: CommentAuthor
  reactionsCount: number
  userLiked: boolean
}

export type EventImage = {
  id: string
  url: string
  format?: string
  size?: number
  order: number
}

export type FeedEvent = {
  id: string
  title: string
  description?: string
  images: EventImage[]
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
  // /feed inclui friendAttendances e reason (personalizados); /events não
  // retorna esses campos. Optional pra refletir o contrato real da API.
  friendAttendances?: FriendAttendance[]
  // Participantes em destaque no mapa: amigos primeiro, depois não-amigos.
  // Quando ausente, o front usa friendAttendances.
  topAttendances?: FriendAttendance[]
  reason?: FeedReason
  recentComments: EventComment[]
  userLiked: boolean
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
  images: EventImage[]
  maxCapacity?: number
  canceledAt?: string | null
  createdAt: string
  updatedAt: string
  authorId: string
  author: FeedAuthor
  userLiked: boolean
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

// Papel do usuário na plataforma. Só /users/me expõe `role` — /users/:id (rota
// pública) NÃO retorna, por isso é opcional em UserProfile e deve ser lido
// apenas do próprio perfil (useMyProfile / useIsAdmin). Premium NÃO é role — é
// um campo separado (isPremium) no backend.
export type UserRole = 'USER' | 'ADMIN'

// Ciclo de vida da conta (soft-delete estilo Instagram/LGPD). Computado pelo
// backend; nunca derivar no client. ANONYMIZED é terminal e nunca chega como 200
// em /users/me (a sessão vira 401 'Sessão inválida').
export type AccountStatus =
  | 'ACTIVE'
  | 'DEACTIVATED'
  | 'PENDING_DELETION'
  | 'ANONYMIZED'

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
  // Presente só em /users/me. Ausente em perfis de terceiros (/users/:id).
  role?: UserRole
  followStatus?: FollowStatus
  eventsCount: number
  followersCount: number
  followingCount: number
  // Values do enum EventCategory (MAIÚSCULAS). Sempre array; vazio = []. Não
  // incluído nos selects reduzidos (/users e /users/search), por isso opcional.
  preferredCategories?: string[]
  // Ciclo de vida da conta — presentes só em /users/me e no user de /auth/*
  // (mesma razão de role?). Em /users/:id são ausentes. Ramificar só nos valores
  // inativos explícitos; undefined = desconhecido/skip.
  hasPassword?: boolean
  accountStatus?: AccountStatus
  deactivatedAt?: string | null
  scheduledDeletionAt?: string | null
}

export type UserEventSummary = {
  id: string
  title: string
  date: string
  category: string
  images: EventImage[]
  address?: string | null
  isPublic: boolean
  attendancesCount?: number
}
