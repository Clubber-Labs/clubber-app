// Motivos de denúncia — enum estável compartilhado entre todos os alvos
// (mensagem, evento, comentário, usuário). Fonte única; os rótulos PT ficam em
// utils/reportLabels.ts pra não espalhar string de UI.
export type ReportReason =
  | 'HATE_SPEECH'
  | 'SPAM_OR_FRAUD'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'OTHER'

// Tipo do conteúdo denunciado. Mapeia 1:1 com os endpoints de criação:
// /events/:id/report, /posts/:id/report, /comments/:id/report,
// /messages/:id/report, /users/:id/report.
export type ReportTargetType = 'event' | 'post' | 'comment' | 'message' | 'user'

// Alvo de uma denúncia em criação. `label` é só contexto opcional pra UI (não
// vai pro backend) — ex: nome do usuário ou título do evento.
export type ReportTarget = {
  type: ReportTargetType
  id: string
  label?: string
}
