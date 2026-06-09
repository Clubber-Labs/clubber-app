import type { MessageReaction } from '../types'

// Conjunto rápido oferecido no long-press (estilo iMessage/WhatsApp). Emojis
// simples (sem ZWJ) pra render previsível em ambas as plataformas.
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const

export type AggregatedReaction = {
  emoji: string
  count: number
  // O usuário atual reagiu com este emoji.
  mine: boolean
}

// Agrega a lista crua em chips por emoji, preservando a ordem da PRIMEIRA
// ocorrência (estável entre renders enquanto ninguém remove a reação pioneira).
export function aggregateReactions(
  reactions: MessageReaction[] | undefined,
  currentUserId: string,
): AggregatedReaction[] {
  if (!reactions || reactions.length === 0) return []
  const order: string[] = []
  const byEmoji = new Map<string, AggregatedReaction>()
  for (const { emoji, userId } of reactions) {
    const current = byEmoji.get(emoji)
    if (current) {
      current.count += 1
      if (userId === currentUserId) current.mine = true
    } else {
      order.push(emoji)
      byEmoji.set(emoji, { emoji, count: 1, mine: userId === currentUserId })
    }
  }
  return order.map(emoji => byEmoji.get(emoji)!)
}

// Emoji com que o usuário atual reagiu (este produto limita a um por usuário).
// Null se ele não reagiu. Se houver mais de um (dado externo), devolve o primeiro.
export function myReaction(
  reactions: MessageReaction[] | undefined,
  currentUserId: string,
): string | null {
  return reactions?.find(r => r.userId === currentUserId)?.emoji ?? null
}

// Toggle de UMA reação por usuário (substitui a anterior — estilo WhatsApp):
//  - tocar no emoji que já é meu → remove (toggle off);
//  - tocar em outro → remove o meu anterior e aplica o novo.
// Pura: aplicada no update otimista; o backend é reconciliado depois com a
// Message inteira (idempotente — substitui, não acumula).
export function toggleMyReaction(
  reactions: MessageReaction[] | undefined,
  emoji: string,
  currentUserId: string,
): MessageReaction[] {
  const base = reactions ?? []
  const hadThis = base.some(
    r => r.userId === currentUserId && r.emoji === emoji,
  )
  const withoutMine = base.filter(r => r.userId !== currentUserId)
  return hadThis
    ? withoutMine
    : [...withoutMine, { userId: currentUserId, emoji }]
}
