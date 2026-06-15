import type { FeedEvent, FriendAttendance } from '@/shared/types'

// Participantes em destaque de um evento: topAttendances (geral, amigos
// primeiro) tem prioridade; cai pra friendAttendances (/feed) e, por fim, lista
// vazia. Centraliza o fallback usado no card, no pin e no preview do mapa.
export function featuredAttendees(event: FeedEvent): FriendAttendance[] {
  return event.topAttendances ?? event.friendAttendances ?? []
}
