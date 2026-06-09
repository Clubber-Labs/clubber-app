import type { UserMini } from '@/shared/types'

export type ConversationType = 'DIRECT' | 'GROUP'
export type Role = 'MEMBER' | 'ADMIN'

// Tipo da mensagem (vindo do backend). SYSTEM = aviso de grupo (entrou/saiu);
// não pode receber reação. Opcional pra degradar em mensagens já em cache sem o
// campo — a gate de reação trata `undefined` como reagível e o backend é a guarda
// final (403 em SYSTEM/apagada).
export type MessageType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'SYSTEM'

// Reação CRUA, uma por (usuário + emoji), como o backend devolve em `reactions`.
// O front agrega contagem e "minha" (ver utils/reactions). Este produto limita a
// UMA reação por usuário — o controle é do cliente (toggleMyReaction).
export type MessageReaction = {
  userId: string
  emoji: string
}

export type AttachmentKind = 'IMAGE' | 'AUDIO' | 'VIDEO'

export type Attachment = {
  id: string
  // Ausente em anexos de imagem (o backend não envia `kind` pra imagem). Quando
  // 'AUDIO', a bolha renderiza o player de voz; quando 'VIDEO', o poster + play.
  // Tratar como imagem quando ausente mantém compatível o que já existe.
  kind?: AttachmentKind
  url: string
  format: string
  size: number
  order: number
  // Presentes só em anexos de áudio (kind 'AUDIO') e vídeo (kind 'VIDEO').
  // `waveform`: inteiros 0..255 (só áudio).
  durationMs?: number
  waveform?: number[]
  // Dimensões do mídia visual (imagem e vídeo) — usadas pra reservar o
  // aspect-ratio da bolha e evitar "pulo" de layout ao carregar.
  width?: number
  height?: number
  // Poster do vídeo (frame de capa). Em imagem o backend pode mandar uma versão
  // reduzida; hoje só o vídeo consome.
  thumbnailUrl?: string
  // CLIENT-ONLY: só existe na bolha otimista de vídeo enquanto o upload ao
  // Cloudinary já completou mas a criação da mensagem (201) ainda não. O retry
  // lê isto pra reusar o upload em vez de re-subir o arquivo. Nunca vem do
  // backend e some quando o `reconcileSent` troca a bolha pelo Message real.
  publicId?: string
}

export type Participant = {
  userId: string
  role: Role
  user: UserMini
  // Watermarks de recibo (entrega/leitura) deste participante, vindos do
  // GET /conversations/:id e atualizados ao vivo pelos frames 'delivered'/'read'.
  // Uma mensagem é "lida"/"entregue" por ele quando createdAt <= watermark.
  // Opcionais — a UI degrada (status cai pra "enviado") quando ausentes, então
  // o app funciona mesmo antes do backend expor lastDeliveredAt/os frames.
  lastReadAt?: string | null
  lastDeliveredAt?: string | null
}

// Prévia da mensagem citada numa resposta — subconjunto de Message que o backend
// devolve em `replyTo` quando a mensagem é uma resposta. (Nome do campo assumido
// como `replyTo`; ajustar aqui se o contrato usar outro.)
export type ReplyPreview = {
  id: string
  content: string | null
  sender: UserMini
  attachments?: Attachment[]
  deletedAt?: string | null
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  sender: UserMini
  // Opcional pra degradar em bolhas otimistas e caches antigos sem o campo.
  type?: MessageType
  // null quando é só imagem OU tombstone (deletedAt != null).
  content: string | null
  attachments: Attachment[]
  // Lista crua de reações. Opcional (degrade-friendly): bolhas otimistas e caches
  // antigos podem não ter — agregadores tratam ausente como []. O backend sempre
  // envia (mesmo que vazio) no REST e no WS.
  reactions?: MessageReaction[]
  createdAt: string
  // Preenchido quando a mensagem foi editada — opcional no backend; a UI só
  // mostra "editada" quando presente (degrada se ausente).
  editedAt?: string | null
  deletedAt: string | null
  // Presente quando esta mensagem é resposta a outra — a citada (preview).
  replyTo?: ReplyPreview | null
}

// Estado só-do-cliente para o envio otimista. `clientId` identifica a bolha
// otimista até o 201 trazer o `id` real; `clientStatus` controla spinner/falha.
// Ausente = persistida (confirmada pelo servidor) → editável/apagável.
export type ChatMessage = Message & {
  clientId?: string
  clientStatus?: 'sending' | 'failed'
}

export type Conversation = {
  id: string
  type: ConversationType
  // null em DM — derive o nome do outro participante.
  title: string | null
  lastMessageAt: string | null
  createdAt: string
  participants: Participant[]
}

export type InboxItem = {
  id: string
  type: ConversationType
  title: string | null
  lastMessageAt: string | null
  participants: Participant[]
  lastMessage: Message | null
  unreadCount: number
}

export type Block = {
  id: string
  createdAt: string
  blocked: UserMini
}

// Frame de entrega ao vivo de uma mensagem NOVA.
export type MessageFrame = {
  type: 'message'
  conversationId: string
  message: Message
}

export function isMessageFrame(value: unknown): value is MessageFrame {
  if (typeof value !== 'object' || value === null) return false
  const frame = value as Record<string, unknown>
  return (
    frame.type === 'message' &&
    typeof frame.conversationId === 'string' &&
    typeof frame.message === 'object' &&
    frame.message !== null
  )
}

// Atualização de mensagem JÁ existente: edição de texto OU reação adicionada/
// removida. O backend emite o evento `message_edited` (snake_case — é o literal do
// contrato; NÃO usar camelCase) com a Message inteira atualizada, e o consumidor
// reconcilia substituindo in-place por id. Não há evento de deleção no WS — o
// soft-delete só reflete via refetch.
export type MessageUpdateFrame = {
  type: 'message_edited'
  conversationId: string
  message: Message
}

export function isMessageUpdateFrame(
  value: unknown,
): value is MessageUpdateFrame {
  if (typeof value !== 'object' || value === null) return false
  const frame = value as Record<string, unknown>
  return (
    frame.type === 'message_edited' &&
    typeof frame.conversationId === 'string' &&
    typeof frame.message === 'object' &&
    frame.message !== null
  )
}

// "Fulano está/parou de digitar" numa conversa. Nunca volta para o próprio autor
// (o servidor já filtra), então não precisa checar "sou eu". O servidor não
// garante o `isTyping:false` — o cliente expira o indicador localmente (TTL).
export type TypingFrame = {
  type: 'typing'
  conversationId: string
  userId: string
  isTyping: boolean
}

export function isTypingFrame(value: unknown): value is TypingFrame {
  if (typeof value !== 'object' || value === null) return false
  const frame = value as Record<string, unknown>
  return (
    frame.type === 'typing' &&
    typeof frame.conversationId === 'string' &&
    typeof frame.userId === 'string' &&
    typeof frame.isTyping === 'boolean'
  )
}

// Presença GLOBAL de um usuário (SEM conversationId — vale para todas as
// conversas/inbox). `lastSeenAt` só vem preenchido quando `online: false`. Nunca
// volta para o próprio autor.
export type PresenceFrame = {
  type: 'presence'
  userId: string
  online: boolean
  lastSeenAt: string | null
}

export function isPresenceFrame(value: unknown): value is PresenceFrame {
  if (typeof value !== 'object' || value === null) return false
  const frame = value as Record<string, unknown>
  return (
    frame.type === 'presence' &&
    typeof frame.userId === 'string' &&
    typeof frame.online === 'boolean'
  )
}

// Recibo de entrega/leitura: `userId` avançou seu watermark até `at` na conversa.
// O backend emite isso pra os OUTROS participantes quando alguém recebe (delivered)
// ou abre (read) — é o que faz os checks atualizarem ao vivo. `at` é ISO 8601.
export type ReceiptFrame = {
  type: 'delivered' | 'read'
  conversationId: string
  userId: string
  at: string
}

export function isReceiptFrame(value: unknown): value is ReceiptFrame {
  if (typeof value !== 'object' || value === null) return false
  const frame = value as Record<string, unknown>
  return (
    (frame.type === 'delivered' || frame.type === 'read') &&
    typeof frame.conversationId === 'string' &&
    typeof frame.userId === 'string' &&
    typeof frame.at === 'string'
  )
}
