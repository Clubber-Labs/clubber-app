import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  onNew: () => void
}

export function InboxEmpty({ onNew }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <View className="w-16 h-16 rounded-full bg-surface items-center justify-center">
        <Ionicons
          name="chatbubbles-outline"
          size={32}
          color={colors.brandEmphasis}
        />
      </View>
      <Text className="text-content font-semibold text-base">
        Nenhuma conversa ainda
      </Text>
      <Text className="text-content-muted text-sm text-center">
        Comece uma conversa com alguém da sua rede.
      </Text>
      <Pressable
        onPress={onNew}
        className="mt-2 bg-brand rounded-full px-5 py-2.5"
        accessibilityLabel="Iniciar conversa"
      >
        <Text className="text-content font-semibold text-sm">
          Iniciar conversa
        </Text>
      </Pressable>
    </View>
  )
}
