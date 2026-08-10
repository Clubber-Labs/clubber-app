import { View, Text, Pressable } from 'react-native'
import { BuildingsIcon } from 'phosphor-react-native'
import type { VenueSuggestion } from '../services/placesService'
import { colors } from '@/shared/theme'

type Props = {
  suggestion: VenueSuggestion
  onPress: () => void
  divider: boolean
}

export function VenueSuggestionItem({ suggestion, onPress, divider }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3 ${divider ? 'border-t border-line' : ''}`}
    >
      <View className="flex-row items-start gap-2">
        <BuildingsIcon
          size={16}
          color={colors.brandText}
          style={{ marginTop: 2 }}
        />
        <View className="flex-1">
          <Text className="text-sm text-content font-medium">
            {suggestion.name}
          </Text>
          {!!suggestion.address && (
            <Text className="text-xs text-content-muted" numberOfLines={1}>
              {suggestion.address}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  )
}
