import { View, Text } from 'react-native'
import {
  useChatRealtimeStore,
  type ConnectionStatus,
} from '../store/chatRealtimeStore'

function describe(status: ConnectionStatus): { color: string; label: string } {
  switch (status) {
    case 'connected':
      return { color: '#22c55e', label: 'ao vivo' }
    case 'connecting':
      return { color: '#eab308', label: 'conectando' }
    case 'reconnecting':
      return { color: '#eab308', label: 'reconectando' }
    default:
      return { color: '#71717a', label: 'offline' }
  }
}

export function ConnectionIndicator() {
  const status = useChatRealtimeStore(s => s.status)
  const { color, label } = describe(status)
  return (
    <View
      className="flex-row items-center gap-1.5"
      accessibilityLabel={`Conexão: ${label}`}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text className="text-xs text-zinc-500">{label}</Text>
    </View>
  )
}
