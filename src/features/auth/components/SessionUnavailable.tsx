import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onRetry: () => void
}

// Mostrada no boot quando /users/me não pôde ser validado por rede/5xx (não é
// sessão inválida — não desloga). Overlay full-screen com retry.
export function SessionUnavailable({ onRetry }: Props) {
  return (
    <View className="absolute inset-0 bg-black items-center justify-center px-8 gap-4">
      <View className="w-16 h-16 rounded-full bg-zinc-900 items-center justify-center">
        <Ionicons name="cloud-offline-outline" size={32} color="#8b5cf6" />
      </View>
      <Text className="text-white font-semibold text-lg text-center">
        Sem conexão
      </Text>
      <Text className="text-zinc-400 text-sm text-center leading-5">
        Não foi possível validar sua sessão. Verifique sua internet e tente de
        novo.
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-2 bg-violet-600 rounded-full px-6 py-3"
        accessibilityLabel="Tentar de novo"
      >
        <Text className="text-white font-semibold">Tentar de novo</Text>
      </Pressable>
    </View>
  )
}
