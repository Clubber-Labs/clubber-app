// Estado de "digitando" de uma conversa: userId → timestamp (ms) em que o
// indicador expira. O servidor não garante o `isTyping:false`, então cada
// `true` renova um TTL e o indicador some sozinho quando ninguém renova.
export type TypingMap = Record<string, number>

// Quanto um `typing:true` mantém o indicador vivo sem novo frame. Folga sobre o
// debounce de envio (~3s) pra cobrir jitter de rede.
export const TYPING_TTL_MS = 5000

// Aplica um frame de typing ao mapa, podando entradas já expiradas no caminho
// (mantém o mapa pequeno e evita timers presos em chaves mortas). Pura.
export function nextTypingState(
  current: TypingMap,
  userId: string,
  isTyping: boolean,
  nowMs: number,
  ttlMs: number = TYPING_TTL_MS,
): TypingMap {
  const next: TypingMap = {}
  for (const id in current) {
    if (current[id] > nowMs) next[id] = current[id]
  }
  if (isTyping) next[userId] = nowMs + ttlMs
  else delete next[userId]
  return next
}

// userIds ainda digitando (expiração no futuro). Pura.
export function activeTypers(
  map: TypingMap | undefined,
  nowMs: number,
): string[] {
  if (!map) return []
  return Object.keys(map).filter(userId => map[userId] > nowMs)
}

// Dois mapas têm o mesmo conteúdo? Usado pra evitar churn no store: ao receber
// uma mensagem chamamos setTyping(false) sempre, e sem este check o estado seria
// recriado mesmo quando nada mudou (quem enviou já não constava como digitando).
export function typingMapsEqual(a: TypingMap, b: TypingMap): boolean {
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length) return false
  return aKeys.every(userId => a[userId] === b[userId])
}

// "Fulano está digitando…" / "Fulano e Beltrano…" / "Várias pessoas…".
// Pura — recebe os nomes já resolvidos. Vazio → string vazia (caller não mostra).
export function typingLabel(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} está digitando…`
  if (names.length === 2) return `${names[0]} e ${names[1]} estão digitando…`
  return 'Várias pessoas estão digitando…'
}
