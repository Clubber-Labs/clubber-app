import { useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '../services/conversationsService'
import {
  applyMessageUpdate,
  setMessageReactions,
  type MsgCache,
} from '../lib/realtimeCache'
import { toggleMyReaction } from '../utils/reactions'
import { chatKeys } from './cacheKeys'
import type { ChatMessage } from '../types'

type ToggleVars = { message: ChatMessage; emoji: string }

// Toggle de reação (UMA por usuário). Update otimista na hora; reconcilia com a
// Message inteira devolvida pelo REST. O eco `message_edited` do WS aplica a
// MESMA Message por id — como ambos SUBSTITUEM (não acumulam), aplicar os dois em
// qualquer ordem é idempotente. Não invalida no settled de propósito: a resposta
// já é autoritativa e o WS sincroniza — refazer a query inteira a cada toque
// seria caro e causaria jank no FlatList.
export function useToggleReaction(conversationId: string, myId: string) {
  const queryClient = useQueryClient()
  const key = chatKeys.messages(conversationId)

  return useMutation({
    mutationFn: async ({ message, emoji }: ToggleVars) => {
      const mineEmojis = (message.reactions ?? [])
        .filter(r => r.userId === myId)
        .map(r => r.emoji)
      const hadThis = mineEmojis.includes(emoji)

      if (hadThis) {
        // Toggle off — remove só este.
        return conversationsService.removeReaction(
          conversationId,
          message.id,
          emoji,
        )
      }

      // Remove as anteriores PRIMEIRO, depois adiciona a nova: assim a invariante
      // "uma por usuário" vale em todo frame intermediário — nenhum eco
      // message_edited mostra duas reações minhas (a alternativa add-first
      // pisca duas brevemente). A resposta do add reflete o estado final.
      for (const prev of mineEmojis) {
        if (prev !== emoji) {
          await conversationsService.removeReaction(
            conversationId,
            message.id,
            prev,
          )
        }
      }
      return conversationsService.addReaction(conversationId, message.id, emoji)
    },
    onMutate: async ({ message, emoji }: ToggleVars) => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<MsgCache>(key)
      const nextReactions = toggleMyReaction(message.reactions, emoji, myId)
      queryClient.setQueryData<MsgCache>(key, old =>
        old
          ? setMessageReactions(old, conversationId, message.id, nextReactions)
          : old,
      )
      return { prev }
    },
    onSuccess: updated => {
      // Substitui a Message inteira por id (cache da conversa + preview do inbox).
      applyMessageUpdate(queryClient, updated)
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
      // O swap (remove + add) não é atômico: se falhar no meio, o servidor pode
      // ter ficado diferente do snapshot restaurado → re-sincroniza via REST. Só
      // no erro (raro), então não há custo no caminho feliz.
      queryClient.invalidateQueries({ queryKey: key })
    },
  })
}
