import { View, Text } from 'react-native'
import { StarIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

// Selo de evento promovido. Pílula do sistema e acento da marca,
// pra conviver com a PrivatePill/EventStatusBadge na faixa do hero.
export function SponsoredBadge() {
  return (
    <View className="flex-row items-center gap-1 rounded-full border border-brand-emphasis/40 bg-brand/20 px-2 py-1">
      <StarIcon size={11} color={colors.brandText} weight="fill" />
      <Text className="text-brand-text text-[11px] font-semibold">
        Patrocinado
      </Text>
    </View>
  )
}
