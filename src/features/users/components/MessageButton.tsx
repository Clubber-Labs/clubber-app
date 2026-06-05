import { Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onPress: () => void
  loading?: boolean
}

// Botão compacto de mensagem ao lado do FollowButton. Mesma altura/estilo do
// Button secondary (py-3 + borda zinc-700) pra alinhar na mesma linha.
export function MessageButton({ onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Enviar mensagem"
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
      className="rounded-lg py-3 px-4 items-center justify-center border border-zinc-700"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#e4e4e7" />
      ) : (
        <Ionicons name="chatbubble-outline" size={20} color="#e4e4e7" />
      )}
    </Pressable>
  )
}
