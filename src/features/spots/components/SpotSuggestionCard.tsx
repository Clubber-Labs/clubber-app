import { View, Text, Pressable } from 'react-native'
import {
  StarIcon,
  NavigationArrowIcon,
  MapPinIcon,
  CaretRightIcon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { useFormatDistance } from '@/shared/hooks/useFormatDistance'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatRating, priceLevelSymbol } from '../utils/suggestionMeta'
import { SpotHighlights } from './SpotHighlights'
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

// Candidato gerado pela IA. Spots não têm foto: o nome do estabelecimento é o
// destaque, com `about`/`highlights` explicando o lugar. O rank 1 ganha faixa de
// motivo + botão primário; os demais ficam compactos com link. Sem avatar — ele
// vive só no pin do mapa.
export function SpotSuggestionCard({
  suggestion,
  rank,
  onChoose,
  reason,
}: Props) {
  const { t } = useTranslation()
  const formatDistance = useFormatDistance()
  const locale = useLocale()
  const { about, highlights, rating, userRatingCount, priceLevel, openNow } =
    suggestion
  const isBest = rank === 1
  const price = priceLevelSymbol(priceLevel)
  const distance =
    typeof suggestion.distanceMeters === 'number'
      ? formatDistance(suggestion.distanceMeters / 1000)
      : null

  // No melhor match a distância vai no rodapé de sinais; nos compactos ela já
  // aparece no cabeçalho, ao lado do rank (evita repetir).
  const meta =
    typeof rating === 'number' || price !== null || (isBest && distance) ? (
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 px-3.5 mt-2.5">
        {typeof rating === 'number' && (
          <View className="flex-row items-center gap-1">
            <StarIcon size={12} color={colors.warning} weight="fill" />
            <Text className="text-content-tertiary text-xs font-semibold">
              {formatRating(rating, locale)}
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
          {t('spots.card.bestMatch')}
        </Text>
      ) : (
        // flex-1 é o espaçador que empurra o selo de aberto/fechado pra direita
        // — fica vazia, e não some, quando não há distância.
        <View className="flex-1 flex-row items-center gap-1">
          {distance && (
            <>
              <NavigationArrowIcon size={11} color={colors.contentSubtle} />
              <Text className="text-content-muted text-xs font-semibold">
                {distance}
              </Text>
            </>
          )}
        </View>
      )}
      {openNow === true ? (
        <View className="flex-row items-center gap-1 rounded-md bg-success/20 border border-success/30 px-2 py-1">
          <View className="w-1.5 h-1.5 rounded-full bg-success-text" />
          <Text className="text-success-text text-[11px] font-bold">
            {isBest ? t('spots.card.openNow') : t('spots.card.open')}
          </Text>
        </View>
      ) : openNow === false ? (
        <View className="rounded-md bg-surface-elevated px-2 py-1">
          <Text className="text-content-muted text-[11px] font-bold">
            {t('spots.card.closed')}
          </Text>
        </View>
      ) : null}
    </View>
  )

  const title = (
    <Text
      numberOfLines={2}
      className={`text-content font-extrabold leading-tight px-3.5 mt-2 ${
        isBest ? 'text-xl' : 'text-base'
      }`}
    >
      {suggestion.name}
    </Text>
  )

  if (isBest) {
    return (
      <View className="bg-surface border border-brand-surface-strong rounded-xl overflow-hidden">
        {reason && <SpotSuggestionReason text={reason} />}
        {header}
        {title}
        {suggestion.address && (
          <View className="flex-row items-center gap-1.5 px-3.5 mt-1.5">
            <MapPinIcon size={13} color={colors.contentMuted} />
            <Text
              numberOfLines={1}
              className="flex-1 text-content-muted text-[13px]"
            >
              {suggestion.address}
            </Text>
          </View>
        )}
        {about && (
          <Text
            numberOfLines={3}
            className="px-3.5 mt-1.5 text-content-muted text-[13px] leading-snug"
          >
            {about}
          </Text>
        )}
        {highlights.length > 0 && (
          <View className="px-3.5 mt-2.5">
            <SpotHighlights items={highlights} />
          </View>
        )}
        {meta}
        <View className="px-3.5 pt-3.5 pb-3.5">
          <Button label={t('spots.card.choose')} onPress={onChoose} />
        </View>
      </View>
    )
  }

  return (
    <Pressable
      onPress={onChoose}
      accessibilityRole="button"
      accessibilityLabel={t('spots.card.chooseNamed', {
        name: suggestion.name,
      })}
      className="bg-surface border border-line rounded-xl overflow-hidden"
    >
      {header}
      {title}
      {about && (
        <Text
          numberOfLines={2}
          className="px-3.5 mt-1 text-content-muted text-[13px] leading-snug"
        >
          {about}
        </Text>
      )}
      {highlights.length > 0 && (
        <View className="px-3.5 mt-2">
          {/* Compacto mostra só os 2 primeiros: a folha de resultados tem
              ~meia tela e 5 chips por card empurrariam a lista pra fora. */}
          <SpotHighlights items={highlights} max={2} />
        </View>
      )}
      {meta}
      <View className="flex-row items-center justify-between px-3.5 py-3 mt-3 border-t border-line">
        <Text className="text-brand-text-bright text-[13px] font-bold">
          {t('spots.card.choose')}
        </Text>
        <CaretRightIcon size={16} color={colors.brandText} />
      </View>
    </Pressable>
  )
}
