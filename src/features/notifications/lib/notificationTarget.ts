import { isKnownNotificationType } from '../utils/isKnownNotificationType'

// Destino de navegação derivado de type + ids — whitelist explícita; nunca uma
// URL vinda do payload.
export type NotificationTarget =
  | { kind: 'event'; eventId: string }
  | { kind: 'profile'; userId: string }
  | { kind: 'followRequests' }
  | { kind: 'spot'; spotId: string; highlightRenew?: boolean }
  // Direto pro grupo do spot (o chat é resolvido via GET /spots/:id).
  | { kind: 'spotChat'; spotId: string }

// Subconjunto que o roteamento usa — satisfeito tanto pela Notification
// completa (central/WS) quanto pelo data enriquecido do push.
type NotificationTargetInput = {
  type: string
  actorId?: string | null
  eventId?: string | null
  spotId?: string | null
}

export function notificationTarget(
  n: NotificationTargetInput,
): NotificationTarget | null {
  // Tipo que este app não conhece: linha não navegável (o tap só marca lida).
  if (!isKnownNotificationType(n.type)) return null

  switch (n.type) {
    case 'FOLLOW_REQUEST':
      return { kind: 'followRequests' }
    case 'NEW_FOLLOWER':
    case 'FOLLOW_ACCEPTED':
      return n.actorId ? { kind: 'profile', userId: n.actorId } : null
    case 'EVENT_NEARBY':
    case 'EVENT_INVITE':
    case 'EVENT_COMMENT':
    case 'EVENT_REACTION':
    case 'EVENT_ATTENDANCE':
      return n.eventId ? { kind: 'event', eventId: n.eventId } : null
    case 'POST_COMMENT':
    case 'POST_REACTION':
    case 'COMMENT_REACTION':
    case 'COMMENT_REPLY':
      // Post não tem rota própria, então o backend manda o eventId dele nesses
      // tipos; sem ele, o melhor destino disponível é o autor.
      if (n.eventId) return { kind: 'event', eventId: n.eventId }
      return n.actorId ? { kind: 'profile', userId: n.actorId } : null
    case 'SPOT_NEARBY':
      return n.spotId ? { kind: 'spot', spotId: n.spotId } : null
    case 'SPOT_JOIN':
      // Novo membro = contexto de conversa: abre direto o chat do grupo.
      return n.spotId ? { kind: 'spotChat', spotId: n.spotId } : null
    case 'SPOT_RENEWAL':
      // "Seu rolê está acabando" → detalhe com o CTA de renovar em destaque.
      return n.spotId
        ? { kind: 'spot', spotId: n.spotId, highlightRenew: true }
        : null
  }
}
