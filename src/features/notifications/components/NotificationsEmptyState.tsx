import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export function NotificationsEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3 py-24">
      <Ionicons name="notifications-off-outline" size={40} color="#52525b" />
      <Text className="text-zinc-400 text-center">
        Nenhuma notificação por aqui.
      </Text>
      <Text className="text-zinc-600 text-sm text-center">
        Atividades da sua rede e eventos perto de você aparecem nesta tela.
      </Text>
    </View>
  )
}
