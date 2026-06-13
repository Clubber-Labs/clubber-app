import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

export function SponsoredBadge() {
  return (
    <View className="flex-row items-center gap-1 bg-brand/20 border border-brand-emphasis/30 px-2 py-0.5 rounded-full">
      <Ionicons name="star" size={10} color={colors.brandText} />
      <Text className="text-brand-text text-xs font-semibold">Patrocinado</Text>
    </View>
  )
}
