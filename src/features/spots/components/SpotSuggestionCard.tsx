import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import type { SpotSuggestion } from '../types'

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
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-2"
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="bg-violet-600 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{rank}</Text>
          </View>
          <Text
            className="text-zinc-300 text-sm font-medium flex-1"
            numberOfLines={1}
          >
            {suggestion.name}
          </Text>
        </View>
        <CategoryBadge value={suggestion.category} />
      </View>

      <Text className="text-white text-base font-bold">
        {suggestion.suggestedTitle}
      </Text>

      {suggestion.suggestedDescription && (
        <Text className="text-zinc-400 text-sm" numberOfLines={2}>
          {suggestion.suggestedDescription}
        </Text>
      )}

      {suggestion.address && (
        <Text className="text-zinc-500 text-xs" numberOfLines={1}>
          {suggestion.address}
        </Text>
      )}

      <View className="flex-row items-center gap-1 mt-1">
        <Text className="text-violet-400 text-sm font-semibold">
          Escolher esse
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#a78bfa" />
      </View>
    </Pressable>
  )
}
