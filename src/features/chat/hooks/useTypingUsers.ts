import { useEffect, useState } from 'react'
import { useTypingStore } from '../store/typingStore'
import { activeTypers } from '../utils/typing'

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i])
}

// userIds atualmente digitando nesta conversa, já expirados localmente. Enquanto
// houver alguém digitando, reavalia a cada segundo pra o indicador sumir mesmo
// sem o frame `isTyping:false` (o servidor não o garante); o intervalo se encerra
// quando todos expiram (sem re-render perpétuo) e reinicia quando chega um frame
// novo (o `map` do store muda de referência → o efeito re-roda).
export function useTypingUsers(conversationId: string): string[] {
  const map = useTypingStore(s => s.byConversation[conversationId])
  const [active, setActive] = useState<string[]>([])

  useEffect(() => {
    let current = activeTypers(map, Date.now())
    setActive(prev => (sameIds(prev, current) ? prev : current))
    if (current.length === 0) return
    const interval = setInterval(() => {
      const next = activeTypers(map, Date.now())
      if (!sameIds(next, current)) {
        current = next
        setActive(next)
      }
      if (next.length === 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [map])

  return active
}
