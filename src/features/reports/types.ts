import type { UserMini } from '@/shared/types'

// Motivos de denúncia — enum estável compartilhado entre todos os alvos
// (mensagem, evento, comentário, usuário). Fonte única; os rótulos PT ficam em
// utils/reportLabels.ts pra não espalhar string de UI.
export type ReportReason =
  | 'HATE_SPEECH'
  | 'SPAM_OR_FRAUD'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'OTHER'

// Ciclo de vida da denúncia no painel de moderação (valores EXATOS do backend).
// RESOLVED_INVALID = improcedente (denúncia descartada); RESOLVED_REMOVED =
// resolvida com remoção do conteúdo. Não existem 'RESOLVED'/'DISMISSED'.
export type ReportStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'RESOLVED_INVALID'
  | 'RESOLVED_REMOVED'

// Tipo do conteúdo denunciado. Mapeia 1:1 com os endpoints de criação:
// /events/:id/report, /comments/:id/report, /messages/:id/report, /users/:id/report.
export type ReportTargetType = 'event' | 'comment' | 'message' | 'user'

// Alvo de uma denúncia em criação. `label` é só contexto opcional pra UI (não
// vai pro backend) — ex: nome do usuário ou título do evento.
export type ReportTarget = {
  type: ReportTargetType
  id: string
  label?: string
}

// Denúncia como devolvida pelo painel admin (GET /reports, GET /reports/:id).
// Campos centrais são garantidos; os ids de alvo e os objetos aninhados vêm
// conforme o tipo do alvo, então são opcionais. Mantém compatível mesmo que o
// backend enriqueça o payload com mais relações no futuro.
export type Report = {
  id: string
  reason: ReportReason
  // Texto livre opcional do denunciante (campo `details` no backend).
  details?: string | null
  status: ReportStatus
  createdAt: string
  updatedAt?: string | null
  // Quem denunciou.
  reporterId?: string | null
  reporter?: UserMini | null
  // Identificadores do alvo — apenas um conjunto é preenchido por denúncia.
  eventId?: string | null
  commentId?: string | null
  messageId?: string | null
  targetUserId?: string | null
  // Prévias aninhadas do alvo, quando o backend as inclui.
  event?: { id: string; title?: string | null } | null
  comment?: { id: string; content?: string | null } | null
  message?: { id: string; content?: string | null } | null
  targetUser?: UserMini | null
}
