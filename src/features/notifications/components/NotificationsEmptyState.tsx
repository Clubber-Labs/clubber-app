import { View, Text } from 'react-native'
import { BellIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

export function NotificationsEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3 py-24">
      <View className="w-16 h-16 rounded-2xl bg-surface border border-line items-center justify-center">
        <BellIcon size={28} color={colors.contentFaint} />
      </View>
      <Text className="text-content text-lg font-bold text-center">
        Tudo em dia por aqui
      </Text>
      <Text className="text-content-muted text-sm text-center">
        Atividades da sua rede e rolês perto de você aparecem nesta tela.
      </Text>
    </View>
  )
}
