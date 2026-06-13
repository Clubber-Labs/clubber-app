import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import type { SpotSuggestion } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  suggestion: SpotSuggestion
  // Posição na lista ranqueada — mesmo número do marcador de rascunho no mapa.
  rank: number
  onChoose: () => void
}

// Card de um candidato gerado pela IA. A copy (suggestedTitle) é o destaque —
// vira o título sugerido do spot ao escolher.
export function SpotSuggestionCard({ suggestion, rank, onChoose }: Props) {
  return (
    <Pressable
      onPress={onChoose}
      accessibilityRole="button"
      accessibilityLabel={`Escolher ${suggestion.name}`}
      className="bg-surface border border-line rounded-2xl p-4 gap-2"
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="bg-brand rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-content text-[10px] font-bold">{rank}</Text>
          </View>
          <Text
            className="text-content-tertiary text-sm font-medium flex-1"
            numberOfLines={1}
          >
            {suggestion.name}
          </Text>
        </View>
        <CategoryBadge value={suggestion.category} />
      </View>

      <Text className="text-content text-base font-bold">
        {suggestion.suggestedTitle}
      </Text>

      {suggestion.suggestedDescription && (
        <Text className="text-content-muted text-sm" numberOfLines={2}>
          {suggestion.suggestedDescription}
        </Text>
      )}

      {suggestion.address && (
        <Text className="text-content-subtle text-xs" numberOfLines={1}>
          {suggestion.address}
        </Text>
      )}

      <View className="flex-row items-center gap-1 mt-1">
        <Text className="text-brand-text text-sm font-semibold">
          Escolher esse
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.brandText} />
      </View>
    </Pressable>
  )
}
