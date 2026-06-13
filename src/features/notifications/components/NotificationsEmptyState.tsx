import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

export function NotificationsEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3 py-24">
      <Ionicons
        name="notifications-off-outline"
        size={40}
        color={colors.contentFaint}
      />
      <Text className="text-content-muted text-center">
        Nenhuma notificação por aqui.
      </Text>
      <Text className="text-content-faint text-sm text-center">
        Atividades da sua rede e eventos perto de você aparecem nesta tela.
      </Text>
    </View>
  )
}
