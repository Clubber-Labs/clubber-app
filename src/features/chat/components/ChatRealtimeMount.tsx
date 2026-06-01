import { useChatRealtime } from '../hooks/useChatRealtime'

type Props = {
  myId: string
  onAuthError: () => void
}

// Componente sem UI montado uma vez na shell autenticada (app/_layout) — mantém
// o socket vivo app-wide pra inbox/unread atualizarem em qualquer tela.
export function ChatRealtimeMount({ myId, onAuthError }: Props) {
  useChatRealtime(myId, onAuthError)
  return null
}
