import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onNew: () => void
}

export function InboxEmpty({ onNew }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <View className="w-16 h-16 rounded-full bg-zinc-900 items-center justify-center">
        <Ionicons name="chatbubbles-outline" size={32} color="#8b5cf6" />
      </View>
      <Text className="text-white font-semibold text-base">
        Nenhuma conversa ainda
      </Text>
      <Text className="text-zinc-400 text-sm text-center">
        Comece uma conversa com alguém da sua rede.
      </Text>
      <Pressable
        onPress={onNew}
        className="mt-2 bg-violet-600 rounded-full px-5 py-2.5"
        accessibilityLabel="Iniciar conversa"
      >
        <Text className="text-white font-semibold text-sm">
          Iniciar conversa
        </Text>
      </Pressable>
    </View>
  )
}
