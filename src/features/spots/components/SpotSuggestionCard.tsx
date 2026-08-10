import { View, Text, Pressable } from 'react-native'
import {
  StarIcon,
  NavigationArrowIcon,
  MapPinIcon,
  CaretRightIcon,
} from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { formatDistance } from '@/shared/utils/distance'
import { formatRating, priceLevelSymbol } from '../utils/suggestionMeta'
import { SpotSuggestionReason } from './SpotSuggestionReason'
import type { SpotSuggestion } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  suggestion: SpotSuggestion
  // Posição na lista ranqueada — mesmo número do marcador de rascunho no mapa.
  rank: number
  onChoose: () => void
  // Faixa de motivo (assinatura da IA). Só o melhor match (rank 1) recebe — o
  // painel passa a intenção/preferência que gerou a sugestão.
  reason?: string
}

// Candidato gerado pela IA. Spots não têm foto: a copy da IA (suggestedTitle) é
// o destaque. O rank 1 ganha faixa de motivo + botão primário; os demais ficam
// compactos com link. Sem avatar — ele vive só no pin do mapa.
export function SpotSuggestionCard({
  suggestion,
  rank,
  onChoose,
  reason,
}: Props) {
  const { rating, userRatingCount, priceLevel, openNow } = suggestion
  const isBest = rank === 1
  const price = priceLevelSymbol(priceLevel)
  const distance =
    typeof suggestion.distanceMeters === 'number'
      ? formatDistance(suggestion.distanceMeters / 1000)
      : null

  // No melhor match a distância vai no rodapé de sinais; nos compactos ela já
  // aparece ao lado do nome no cabeçalho (evita repetir).
  const meta =
    typeof rating === 'number' || price !== null || (isBest && distance) ? (
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 px-3.5 mt-2.5">
        {typeof rating === 'number' && (
          <View className="flex-row items-center gap-1">
            <StarIcon size={12} color={colors.warning} weight="fill" />
            <Text className="text-content-tertiary text-xs font-semibold">
              {formatRating(rating)}
              {typeof userRatingCount === 'number' && ` (${userRatingCount})`}
            </Text>
          </View>
        )}
        {price && (
          <Text className="text-content-tertiary text-xs font-semibold">
            {price}
          </Text>
        )}
        {isBest && distance && (
          <View className="flex-row items-center gap-1">
            <NavigationArrowIcon size={12} color={colors.contentSubtle} />
            <Text className="text-content-tertiary text-xs">{distance}</Text>
          </View>
        )}
      </View>
    ) : null

  const header = (
    <View className="flex-row items-center gap-2 px-3.5 pt-3.5">
      <View className="w-6 h-6 rounded-full bg-brand items-center justify-center">
        <Text className="text-content text-xs font-extrabold">{rank}</Text>
      </View>
      {isBest ? (
        <Text className="flex-1 text-brand-text-bright text-xs font-extrabold">
          Melhor match
        </Text>
      ) : (
        <Text
          numberOfLines={1}
          className="flex-1 text-content-muted text-xs font-semibold"
        >
          {suggestion.name}
          {distance && ` · ${distance}`}
        </Text>
      )}
      {openNow === true ? (
        <View className="flex-row items-center gap-1 rounded-md bg-success/20 border border-success/30 px-2 py-1">
          <View className="w-1.5 h-1.5 rounded-full bg-success-text" />
          <Text className="text-success-text text-[11px] font-bold">
            {isBest ? 'Aberto agora' : 'Aberto'}
          </Text>
        </View>
      ) : openNow === false ? (
        <View className="rounded-md bg-surface-elevated px-2 py-1">
          <Text className="text-content-muted text-[11px] font-bold">
            Fechado
          </Text>
        </View>
      ) : null}
    </View>
  )

  const title = (
    <Text
      className={`text-content font-extrabold leading-tight px-3.5 mt-2 ${
        isBest ? 'text-xl' : 'text-base'
      }`}
    >
      {suggestion.suggestedTitle}
    </Text>
  )

  if (isBest) {
    return (
      <View className="bg-surface border border-brand-surface-strong rounded-xl overflow-hidden">
        {reason && <SpotSuggestionReason text={reason} />}
        {header}
        {title}
        <View className="flex-row items-center gap-1.5 px-3.5 mt-1.5">
          <MapPinIcon size={13} color={colors.contentMuted} />
          <Text
            numberOfLines={1}
            className="flex-1 text-content-muted text-[13px]"
          >
            {suggestion.name}
            {suggestion.address && ` · ${suggestion.address}`}
          </Text>
        </View>
        {suggestion.suggestedDescription && (
          <Text
            numberOfLines={2}
            className="px-3.5 mt-1.5 text-content-muted text-[13px] leading-snug"
          >
            {suggestion.suggestedDescription}
          </Text>
        )}
        {meta}
        <View className="px-3.5 pt-3.5 pb-3.5">
          <Button label="Escolher esse rolê" onPress={onChoose} />
        </View>
      </View>
    )
  }

  return (
    <Pressable
      onPress={onChoose}
      accessibilityRole="button"
      accessibilityLabel={`Escolher ${suggestion.name}`}
      className="bg-surface border border-line rounded-xl overflow-hidden"
    >
      {header}
      {title}
      {meta}
      <View className="flex-row items-center justify-between px-3.5 py-3 mt-3 border-t border-line">
        <Text className="text-brand-text-bright text-[13px] font-bold">
          Escolher esse rolê
        </Text>
        <CaretRightIcon size={16} color={colors.brandText} />
      </View>
    </Pressable>
  )
}
