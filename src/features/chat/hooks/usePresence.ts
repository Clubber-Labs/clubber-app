import { usePresenceStore, type Presence } from '../store/presenceStore'

// Presença global de um usuário (online + visto por último). `undefined` =
// desconhecido (nenhuma transição chegou ainda pelo WS) → a UI não mostra estado.
export function usePresence(userId: string | undefined): Presence | undefined {
  return usePresenceStore(s => (userId ? s.byUser[userId] : undefined))
}
