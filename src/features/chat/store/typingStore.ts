import { create } from 'zustand'
import {
  nextTypingState,
  typingMapsEqual,
  type TypingMap,
} from '../utils/typing'

type TypingState = {
  // conversationId → (userId → expiraEm ms). Efêmero, só do socket.
  byConversation: Record<string, TypingMap>
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void
  // Remove o usuário de todas as conversas (ex.: ficou offline). O indicador
  // some na hora em vez de esperar o TTL.
  clearUser: (userId: string) => void
  // Zera tudo — chamado no logout (endSession) pra não vazar "digitando" entre
  // contas na mesma sessão de app.
  reset: () => void
}

export const useTypingStore = create<TypingState>(set => ({
  byConversation: {},
  setTyping: (conversationId, userId, isTyping) =>
    set(state => {
      const current = state.byConversation[conversationId] ?? {}
      const next = nextTypingState(current, userId, isTyping, Date.now())
      // Nada mudou (ex.: mensagem recebida de quem já não constava como
      // digitando) → devolve o MESMO estado pra o zustand não notificar.
      if (typingMapsEqual(current, next)) return state
      return {
        byConversation: { ...state.byConversation, [conversationId]: next },
      }
    }),
  clearUser: userId =>
    set(state => {
      const byConversation: Record<string, TypingMap> = {}
      for (const conversationId in state.byConversation) {
        const map = { ...state.byConversation[conversationId] }
        delete map[userId]
        byConversation[conversationId] = map
      }
      return { byConversation }
    }),
  reset: () => set({ byConversation: {} }),
}))
