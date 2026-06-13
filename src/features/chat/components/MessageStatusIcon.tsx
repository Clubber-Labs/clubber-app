import { ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { MessageStatus } from '../utils/messageStatus'
import { colors } from '@/shared/theme'

type Props = {
  status: MessageStatus | null
}

// Indicador ao lado do horário, só nas mensagens do autor (sempre sobre a bolha
// violeta): ⧖ enviando · ✓ enviado · ✓✓ entregue (claro) · ✓✓ lido (azul). O
// estado 'failed' é tratado fora (linha "Tentar de novo"), então aqui não renderiza.
export function MessageStatusIcon({ status }: Props) {
  if (!status || status === 'failed') return null

  if (status === 'sending') {
    return <ActivityIndicator size="small" color={colors.brandTextBright} />
  }
  if (status === 'sent') {
    return (
      <Ionicons name="checkmark" size={14} color={colors.brandTextBright} />
    )
  }
  // delivered | read — check duplo; azul quando lido.
  return (
    <Ionicons
      name="checkmark-done"
      size={14}
      color={status === 'read' ? colors.info : colors.brandTextBright}
    />
  )
}
