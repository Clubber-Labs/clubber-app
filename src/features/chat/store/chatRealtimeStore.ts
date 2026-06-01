import { create } from 'zustand'

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'

type ChatRealtimeState = {
  status: ConnectionStatus
  // Conversa aberta na tela — define se uma mensagem recebida incrementa o
  // unread (não incrementa se a conversa está ativa) e dispara o POST /read.
  activeConversationId: string | null
  setStatus: (status: ConnectionStatus) => void
  setActiveConversation: (id: string | null) => void
}

export const useChatRealtimeStore = create<ChatRealtimeState>(set => ({
  status: 'offline',
  activeConversationId: null,
  setStatus: status => set({ status }),
  setActiveConversation: id => set({ activeConversationId: id }),
}))
