import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  message: string
  variant?: 'error' | 'info'
}

export function MapStatusBanner({ message, variant = 'info' }: Props) {
  const isError = variant === 'error'
  return (
    <View className="absolute top-16 self-center px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 bg-surface/90 border-line">
      <Ionicons
        name={isError ? 'alert-circle' : 'information-circle'}
        size={14}
        color={colors.content}
      />
      <Text className="text-xs text-content">{message}</Text>
    </View>
  )
}
