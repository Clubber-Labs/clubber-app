const DAY_MS = 24 * 60 * 60 * 1000
const LONG_FOLLOW_DAYS = 30

// Deixar de seguir só pede confirmação quando o vínculo é antigo: um follow
// recente desfeito é correção de toque, não decisão. Sem a data (backend ainda
// sem o campo, ou valor ilegível) a idade é desconhecida — e desconhecido
// confirma: perder um follow antigo por engano custa mais que um toque a mais.
export function shouldConfirmUnfollow(
  followedAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!followedAt) return true
  const since = Date.parse(followedAt)
  if (Number.isNaN(since)) return true
  return now - since > LONG_FOLLOW_DAYS * DAY_MS
}
