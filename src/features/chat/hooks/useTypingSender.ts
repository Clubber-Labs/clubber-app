import { useCallback, useEffect, useRef } from 'react'
import { chatSocket } from '../lib/chatSocket'

// Sem novo keystroke por este tempo → manda `isTyping:false`. O servidor não
// para o typing sozinho, então o debounce é responsabilidade do cliente.
const STOP_AFTER_MS = 3000

// Envia o sinal "digitando" com debounce: um único `true` ao começar, renovado
// silenciosamente enquanto digita, e `false` após inatividade / ao enviar / ao
// sair da conversa. Frames são best-effort (descartados se o socket estiver
// offline) — o indicador é efêmero.
export function useTypingSender(conversationId: string) {
  const isTypingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (isTypingRef.current) {
      isTypingRef.current = false
      chatSocket.send({ type: 'typing', conversationId, isTyping: false })
    }
  }, [conversationId])

  const onType = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      chatSocket.send({ type: 'typing', conversationId, isTyping: true })
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(stop, STOP_AFTER_MS)
  }, [conversationId, stop])

  // Ao desmontar ou trocar de conversa, encerra o typing pendente (o `stop`
  // antigo fecha sobre o conversationId antigo — manda o `false` certo).
  useEffect(() => stop, [stop])

  return { onType, stop }
}
