import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  message: string
  variant?: 'error' | 'info'
}

export function MapStatusBanner({ message, variant = 'info' }: Props) {
  const isError = variant === 'error'
  return (
    <View className="absolute top-16 self-center px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 bg-zinc-900/90 border-zinc-800">
      <Ionicons
        name={isError ? 'alert-circle' : 'information-circle'}
        size={14}
        color="#ffffff"
      />
      <Text className="text-xs text-white">{message}</Text>
    </View>
  )
}
