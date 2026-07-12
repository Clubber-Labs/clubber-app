import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  venueName: string
  address: string
  onClear: () => void
}

export function SelectedVenueCard({ venueName, address, onClear }: Props) {
  return (
    <View className="flex-row items-center gap-3 border border-line bg-surface rounded-xl px-4 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated">
        <Ionicons name="business" size={18} color={colors.brandText} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-content" numberOfLines={1}>
          {venueName}
        </Text>
        {!!address && (
          <Text className="text-xs text-content-muted" numberOfLines={1}>
            {address}
          </Text>
        )}
      </View>
      <Pressable
        onPress={onClear}
        accessibilityLabel="Remover estabelecimento"
        hitSlop={8}
      >
        <Ionicons name="close-circle" size={22} color={colors.contentSubtle} />
      </Pressable>
    </View>
  )
}
