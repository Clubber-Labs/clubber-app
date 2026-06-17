import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatDistance } from '@/shared/utils/distance'
import { formatRating, priceLevelSymbol } from '../utils/suggestionMeta'
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
  const { rating, userRatingCount, priceLevel, openNow, distanceMeters } =
    suggestion
  const price = priceLevelSymbol(priceLevel)
  // Sinais podem faltar (undefined) ou vir null — só renderiza o que for válido.
  const hasMeta =
    typeof distanceMeters === 'number' ||
    typeof rating === 'number' ||
    !!price ||
    typeof openNow === 'boolean'

  return (
    <Pressable
      onPress={onChoose}
      accessibilityRole="button"
      accessibilityLabel={`Escolher ${suggestion.name}`}
      className="bg-surface border border-line rounded-2xl p-4 gap-2"
    >
      <View className="flex-row items-center gap-2">
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

      {hasMeta && (
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
          {typeof distanceMeters === 'number' && (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="navigate-outline"
                size={12}
                color={colors.contentSubtle}
              />
              <Text className="text-content-subtle text-xs">
                {formatDistance(distanceMeters / 1000)}
              </Text>
            </View>
          )}

          {typeof rating === 'number' && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text className="text-content-subtle text-xs">
                {formatRating(rating)}
                {typeof userRatingCount === 'number' && ` (${userRatingCount})`}
              </Text>
            </View>
          )}

          {price && (
            <Text className="text-content-subtle text-xs">{price}</Text>
          )}

          {typeof openNow === 'boolean' && (
            <Text
              className={`text-xs font-semibold ${
                openNow ? 'text-success-text' : 'text-content-muted'
              }`}
            >
              {openNow ? 'Aberto agora' : 'Fechado'}
            </Text>
          )}
        </View>
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
