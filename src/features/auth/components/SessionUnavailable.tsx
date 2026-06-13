import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  onRetry: () => void
}

// Mostrada no boot quando /users/me não pôde ser validado por rede/5xx (não é
// sessão inválida — não desloga). Overlay full-screen com retry.
export function SessionUnavailable({ onRetry }: Props) {
  return (
    <View className="absolute inset-0 bg-background items-center justify-center px-8 gap-4">
      <View className="w-16 h-16 rounded-full bg-surface items-center justify-center">
        <Ionicons
          name="cloud-offline-outline"
          size={32}
          color={colors.brandEmphasis}
        />
      </View>
      <Text className="text-content font-semibold text-lg text-center">
        Sem conexão
      </Text>
      <Text className="text-content-muted text-sm text-center leading-5">
        Não foi possível validar sua sessão. Verifique sua internet e tente de
        novo.
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-2 bg-brand rounded-full px-6 py-3"
        accessibilityLabel="Tentar de novo"
      >
        <Text className="text-content font-semibold">Tentar de novo</Text>
      </Pressable>
    </View>
  )
}
