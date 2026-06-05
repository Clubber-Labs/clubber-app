import { ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { MessageStatus } from '../utils/messageStatus'

type Props = {
  status: MessageStatus | null
}

// Indicador ao lado do horário, só nas mensagens do autor (sempre sobre a bolha
// violeta): ⧖ enviando · ✓ enviado · ✓✓ entregue (claro) · ✓✓ lido (azul). O
// estado 'failed' é tratado fora (linha "Tentar de novo"), então aqui não renderiza.
export function MessageStatusIcon({ status }: Props) {
  if (!status || status === 'failed') return null

  if (status === 'sending') {
    return <ActivityIndicator size="small" color="#ddd6fe" />
  }
  if (status === 'sent') {
    return <Ionicons name="checkmark" size={14} color="#ddd6fe" />
  }
  // delivered | read — check duplo; azul quando lido.
  return (
    <Ionicons
      name="checkmark-done"
      size={14}
      color={status === 'read' ? '#7dd3fc' : '#ddd6fe'}
    />
  )
}
