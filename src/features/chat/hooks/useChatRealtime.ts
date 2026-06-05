import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { getToken } from '@/shared/lib/secureStore'
import { chatSocket } from '../lib/chatSocket'
import {
  applyIncomingMessage,
  applyMessageToInbox,
  applyMessageUpdate,
  applyReceipt,
  inboxHasConversation,
  resetInboxUnread,
} from '../lib/realtimeCache'
import { conversationsService } from '../services/conversationsService'
import { useChatRealtimeStore } from '../store/chatRealtimeStore'
import { chatKeys } from './cacheKeys'
import type { MessageFrame, MessageUpdateFrame, ReceiptFrame } from '../types'

// Ack de entrega é best-effort: o backend já marca "delivered" server-side ao
// entregar a mensagem no socket (e emite o frame de volta), então este POST é só
// fallback. Um throttle por conversa evita N requests redundantes numa rajada de
// mensagens recebidas com a conversa fechada — sem efeito visível, já que o status
// real chega pelo caminho server-side.
const DELIVERED_ACK_THROTTLE_MS = 3000
const lastDeliveredAck = new Map<string, number>()

function ackDelivered(conversationId: string) {
  const now = Date.now()
  const last = lastDeliveredAck.get(conversationId) ?? 0
  if (now - last < DELIVERED_ACK_THROTTLE_MS) return
  lastDeliveredAck.set(conversationId, now)
  conversationsService.markDelivered(conversationId).catch(() => {})
}

// Liga o socket ao ciclo de vida (foreground/background) e roteia os frames
// recebidos para o cache do TanStack Query. `myId` e `onAuthError` vêm da camada
// app (que lê o authStore) — chat não importa de outra feature.
export function useChatRealtime(myId: string, onAuthError: () => void) {
  const queryClient = useQueryClient()
  const setStatus = useChatRealtimeStore(s => s.setStatus)

  useEffect(() => {
    const handlers = {
      onStatus: setStatus,
      onMessageFrame: ({ conversationId, message }: MessageFrame) => {
        const isActive =
          useChatRealtimeStore.getState().activeConversationId ===
          conversationId

        // Mensagens (só aplica se a conversa já estiver carregada no cache).
        applyIncomingMessage(queryClient, message, myId)

        // Inbox: atualiza se a conversa existe; senão é uma conversa nova
        // (1º contato) → refetch da inbox.
        if (inboxHasConversation(queryClient, conversationId)) {
          applyMessageToInbox(queryClient, message, myId, isActive)
        } else {
          queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
        }

        // Mensagem de outro: tela aberta → marca LIDA; fechada → confirma só a
        // ENTREGA. (markRead no backend também avança o watermark de entrega.)
        if (message.senderId !== myId) {
          if (isActive) {
            conversationsService.markRead(conversationId).catch(() => {})
            resetInboxUnread(queryClient, conversationId)
          } else {
            ackDelivered(conversationId)
          }
        }
      },
      onMessageUpdate: ({ message }: MessageUpdateFrame) => {
        // Edição/deleção de mensagem já existente — atualiza in-place por id.
        applyMessageUpdate(queryClient, message)
      },
      onReceipt: (frame: ReceiptFrame) => {
        // Entrega/leitura de um participante → avança watermark na conversa.
        applyReceipt(queryClient, frame)
      },
      onReconnect: () => {
        // Sem replay no socket — rebusca inbox e a conversa ativa.
        queryClient.invalidateQueries({ queryKey: chatKeys.inbox })
        const active = useChatRealtimeStore.getState().activeConversationId
        if (active) {
          queryClient.invalidateQueries({ queryKey: chatKeys.messages(active) })
          queryClient.invalidateQueries({
            queryKey: chatKeys.conversation(active),
          })
        }
      },
      onAuthError,
    }

    chatSocket.start(getToken, handlers)

    // Conecta em foreground, fecha em background.
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') chatSocket.start(getToken, handlers)
      else if (state === 'background') chatSocket.stop()
    })

    return () => {
      sub.remove()
      chatSocket.stop()
    }
  }, [myId, onAuthError, queryClient, setStatus])
}
