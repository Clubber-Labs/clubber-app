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
export type Subcategory = {
  value: string
  label: string
}

export type Category = {
  value: string
  label: string
  // 2º nível: refina o tipo de venue (ex.: GASTRONOMY_JAPONESA). Pode vir [] e
  // é opcional para tolerar backend antigo que ainda não expõe o aninhamento.
  subcategories?: Subcategory[]
}

/**
 * Gênero musical — dimensão transversal à vida noturna (não pertence a uma
 * categoria só). `appliesTo` lista as categorias a que se aplica (ex.: PARTY,
 * MUSIC, NIGHTLIFE), permitindo gating dinâmico sem lista hardcoded no app.
 */
export type Genre = {
  value: string
  label: string
  appliesTo: string[]
}

export type CategoriesResponse = {
  locale: string
  data: Category[]
  // Lista plana de gêneros. Opcional para degradar se o backend ainda não a expõe.
  genres?: Genre[]
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
  isFeatured?: boolean
  createdAt: string
  date: string
  endDate?: string | null
  // IANA do local do evento: a hora exibida é a de parede DE LÁ, não a do
  // aparelho de quem lê. Aditivo — pode não vir em resposta antiga.
  timezone?: string | null
  status?: EventStatus | null
  canceledAt?: string | null
  latitude: number
  longitude: number
  address?: string
  // Estabelecimento (Google Places). Quando presente, é o local principal e o
  // address vira secundário na exibição. Ausente = evento com endereço de rua.
  venueName?: string | null
  categories: string[]
  // Chaves de 2º nível (subcategorias/gêneros). Aditivo — pode não vir.
  subcategories?: string[]
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
  timezone?: string | null
  status?: EventStatus | null
  isFeatured?: boolean
  latitude: number
  longitude: number
  address?: string
  // Estabelecimento (Google Places). placeId é reenviado no PUT para preservar
  // o vínculo quando o usuário edita sem trocar de local; venueName é o rótulo
  // principal na exibição. Ambos ausentes/null = endereço de rua.
  placeId?: string | null
  venueName?: string | null
  categories: string[]
  // Chaves de 2º nível (subcategorias/gêneros). Aditivo — pode não vir.
  subcategories?: string[]
  isPublic: boolean
  images: EventImage[]
  maxCapacity?: number
  canceledAt?: string | null
  createdAt: string
  updatedAt: string
  authorId: string
  author: FeedAuthor
  // Participantes em destaque (amigos primeiro) para a prova social "quem vai".
  // Espelha o que o mapa/feed já trazem; o backend popula em GET /events/:id.
  topAttendances?: FriendAttendance[]
  userLiked: boolean
  userAttendance: AttendanceType | null
  _count: {
    attendances: number
    reactions: number
    comments: number
  }
}

// Link de convite gerado pelo autor (POST /events/:id/invite-links). A `url`
// vem pronta do backend — o client nunca monta a URL pública do convite.
export type InviteLink = {
  id: string
  token: string
  url: string
  expiresAt: string
  usesCount: number
}

// Preview público do convite (GET /invites/:token — auth opcional).
export type InvitePreview = {
  event: {
    id: string
    title: string
    description: string | null
    date: string
    endDate: string | null
    timezone: string
    isPublic: boolean
    coverUrl: string | null
    author: FeedAuthor
  }
  viewer: { hasAccess: boolean }
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
  images?: EventImage[]
  _count?: {
    comments: number
    reactions: number
  }
}

export type FollowStatus = 'PENDING' | 'ACCEPTED' | null

// Papel do usuário na plataforma. Só /users/me expõe `role` — /users/:id (rota
// pública) NÃO retorna, por isso é opcional em UserProfile e deve ser lido
// apenas do próprio perfil (useMyProfile). Premium NÃO é role — é
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

/** Artista do Spotify exibido no perfil. `spotifyUrl` é a atribuição de volta. */
export type ProfileArtist = {
  id: string
  name: string
  imageUrl: string | null
  spotifyUrl: string
}

/**
 * Artistas que o visitante e o dono do perfil ouvem em comum. `named` vem
 * vazio quando o dono escondeu a fileira — aí só a contagem é exibível.
 */
export type ArtistMatch = {
  count: number
  named: ProfileArtist[]
}

export type UserProfile = {
  id: string
  name: string
  lastname: string
  username: string
  bio?: string | null
  avatarUrl?: string | null
  isPrivate: boolean
  // Só vem no perfil próprio (GET /users/me) — gates de UI premium e paywall.
  isPremium?: boolean
  birthdate?: string
  phone?: string
  email?: string
  createdAt: string
  // Presente só em /users/me. Ausente em perfis de terceiros (/users/:id).
  role?: UserRole
  followStatus?: FollowStatus
  // Sentido inverso (pessoa → viewer), já resolvido em ACCEPTED. Junto com
  // followStatus responde se o follow é mútuo — o que perfil privado exige pra
  // liberar conversa. Opcional pra degradar contra backend anterior ao campo.
  followsYou?: boolean
  eventsCount: number
  followersCount: number
  followingCount: number
  // Values do enum EventCategory (MAIÚSCULAS). Sempre array; vazio = []. Não
  // incluído nos selects reduzidos (/users e /users/search), por isso opcional.
  preferredCategories?: string[]
  // Interesses de 2º nível (subcategorias + gêneros) na mesma lista. Mesma
  // semântica de presença/ausência de preferredCategories.
  preferredSubcategories?: string[]
  // Top artistas do Spotify já FILTRADOS pelo servidor: vem vazio quando o
  // dono escondeu, ocultou o artista ou o vínculo foi revogado. O app só
  // desenha — nunca decide o que mostrar.
  topArtists?: ProfileArtist[]
  // Estado do toggle de exibição. Só em /users/me: em perfil de terceiro nem
  // revelamos que alguém escondeu algo.
  spotifyArtistsVisible?: boolean
  // Só em perfil de terceiro, e null quando não há interseção — o servidor
  // não devolve "0 em comum", que não seria informação.
  artistMatch?: ArtistMatch | null
  // Raio de interesse das notificações de proximidade (km). Presente só em
  // /users/me e só em backends que já expõem o campo no select privado.
  notifyRadiusKm?: number
  // Raio salvo da busca de sugestões de spots (km). Presente em /users/me;
  // override por geração vai no body de POST /spots/suggestions.
  spotRadiusKm?: number
  // Ciclo de vida da conta — presentes só em /users/me e no user de /auth/*
  // (mesma razão de role?). Em /users/:id são ausentes. Ramificar só nos valores
  // inativos explícitos; undefined = desconhecido/skip.
  hasPassword?: boolean
  accountStatus?: AccountStatus
  deactivatedAt?: string | null
  scheduledDeletionAt?: string | null
  // Preferências de produto (opt-out, default true no servidor). Vivem no
  // perfil, e NÃO no registro de consentimento: são configuração, não
  // declaração de vontade. Só em /users/me.
  socialFeed?: boolean
  socialVisibility?: boolean
  analytics?: boolean
  // Resumo do consentimento que vem junto do perfil. Hoje o app consome só o
  // `version` (aviso de política atualizada); o estado revogado em runtime sai
  // do consentStore, hidratado do GET /consent — mesma origem no servidor, e
  // uma fonte só no client.
  consent?: {
    given: boolean
    version: string
    revokedAt: string | null
  }
}

export type UserEventSummary = {
  id: string
  title: string
  date: string
  categories: string[]
  images: EventImage[]
  address?: string | null
  isPublic: boolean
  attendancesCount?: number
}
