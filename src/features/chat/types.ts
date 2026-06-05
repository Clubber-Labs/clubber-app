import type { UserMini } from '@/shared/types'

export type ConversationType = 'DIRECT' | 'GROUP'
export type Role = 'MEMBER' | 'ADMIN'

export type AttachmentKind = 'IMAGE' | 'AUDIO'

export type Attachment = {
  id: string
  // Ausente em anexos de imagem (o backend não envia `kind` pra imagem). Quando
  // 'AUDIO', a bolha renderiza o player de voz em vez de <Image>. Tratar como
  // imagem quando ausente mantém compatível o que já existe.
  kind?: AttachmentKind
  url: string
  format: string
  size: number
  order: number
  // Presentes só em anexos de áudio (kind 'AUDIO'). `waveform`: inteiros 0..255.
  durationMs?: number
  waveform?: number[]
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
  // null quando é só imagem OU tombstone (deletedAt != null).
  content: string | null
  attachments: Attachment[]
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

export type ReportReason =
  | 'HATE_SPEECH'
  | 'SPAM_OR_FRAUD'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'OTHER'

// Frame de entrega ao vivo. Só `message` é tratado; outros tipos (typing,
// presence) são tolerados e ignorados — ver isMessageFrame.
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

// Atualização de mensagem JÁ existente (edição ou deleção). Carrega o Message
// atualizado — o consumidor substitui in-place por id, em vez de inserir.
export type MessageUpdateFrame = {
  type: 'messageEdited' | 'messageDeleted'
  conversationId: string
  message: Message
}

export function isMessageUpdateFrame(
  value: unknown,
): value is MessageUpdateFrame {
  if (typeof value !== 'object' || value === null) return false
  const frame = value as Record<string, unknown>
  return (
    (frame.type === 'messageEdited' || frame.type === 'messageDeleted') &&
    typeof frame.conversationId === 'string' &&
    typeof frame.message === 'object' &&
    frame.message !== null
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
