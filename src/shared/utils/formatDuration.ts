// Duração de mídia em mm:ss (ex.: 0:07, 1:23, 10:00). Distinto de formatMessageTime,
// que formata um horário do relógio (HH:mm) — aqui é tempo decorrido/total.
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
