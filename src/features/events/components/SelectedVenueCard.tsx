import { View, Text, Pressable } from 'react-native'
import { BuildingsIcon, XCircleIcon } from 'phosphor-react-native'
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
        <BuildingsIcon size={18} color={colors.brandText} weight="fill" />
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
        <XCircleIcon size={22} color={colors.contentSubtle} weight="fill" />
      </Pressable>
    </View>
  )
}
