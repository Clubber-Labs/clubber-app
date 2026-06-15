import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

// Selo de evento promovido. Cantos do sistema (rounded-md) e acento da marca,
// pra conviver com a PrivatePill/EventStatusBadge na faixa do hero.
export function SponsoredBadge() {
  return (
    <View className="flex-row items-center gap-1 rounded-md border border-brand-emphasis/40 bg-brand/20 px-2 py-1">
      <Ionicons name="star" size={11} color={colors.brandText} />
      <Text className="text-brand-text text-[11px] font-semibold">
        Patrocinado
      </Text>
    </View>
  )
}
