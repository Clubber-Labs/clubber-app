import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { GlassSurface } from '@/shared/components/GlassSurface'
import { useLocale } from '@/shared/hooks/useLocale'
import { useFormatDistance } from '@/shared/hooks/useFormatDistance'
import { distanceKm } from '@/shared/utils/distance'
import {
  formatDayOfMonth,
  formatTime,
  formatWeekday,
} from '@/shared/utils/dateFormat'
import { formatSpotWindow } from '../utils/spotWindow'
import type { Spot } from '../types'

type Props = {
  spot: Spot
  live: boolean
  // Coords do usuário [lng, lat]. Sem elas a distância some da faixa — a tela é
  // dona da localização, o card não pede a sua.
  userCoords: [number, number] | null
  onPress: () => void
}

const RADIUS = 12

/**
 * Faixa de vidro no pé do mini-mapa: onde é (com a distância) de um lado, a
 * janela do outro. A janela muda de leitura conforme o estado — rolando agora,
 * o que importa é quando acaba; agendado, é a faixa de horário e o dia.
 */
export function SpotWindowBar({ spot, live, userCoords, onPress }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const formatDistance = useFormatDistance()

  const distance = userCoords
    ? formatDistance(distanceKm(userCoords, [spot.longitude, spot.latitude]))
    : null
  // Sem nome do lugar o endereço sobe pra linha principal (mesma regra da
  // faixa do card de evento); sem nenhum dos dois, sobra a distância.
  const primary = spot.placeName ?? spot.address ?? null
  const place = primary
    ? distance
      ? t('spots.feedCard.placeWithDistance', { place: primary, distance })
      : primary
    : distance
      ? t('spots.feedCard.away', { distance })
      : null
  const secondary = spot.placeName ? spot.address : null

  const when = live
    ? {
        primary: t('spots.feedCard.untilTime', {
          time: formatTime(spot.endsAt, locale),
        }),
        secondary: t('spots.feedCard.startedAt', {
          time: formatTime(spot.startsAt, locale),
        }),
      }
    : {
        primary: t('spots.feedCard.timeRange', {
          start: formatTime(spot.startsAt, locale),
          end: formatTime(spot.endsAt, locale),
        }),
        secondary: t('spots.feedCard.dayLine', {
          weekday: formatWeekday(spot.startsAt, locale),
          day: formatDayOfMonth(spot.startsAt, locale),
        }),
      }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        // A faixa abre o app de mapas: o rótulo é o destino. Sem nome de lugar,
        // a janela é a única identificação que sobra.
        spot.placeName ?? formatSpotWindow(spot.startsAt, spot.endsAt, locale)
      }
      className="absolute inset-x-3 bottom-3 overflow-hidden rounded-xl active:opacity-80"
    >
      {/* O véu neutro do GlassSurface fica por baixo; o corpo vem do
          bg-surface/80 aqui, sem abrir uma segunda receita de vidro no app. */}
      <GlassSurface style={{ borderRadius: RADIUS }}>
        <View className="flex-row items-center bg-surface/80">
          {place ? (
            <View className="flex-1 py-2 pl-3 pr-2.5">
              <Text
                className="text-[13px] font-bold text-content"
                numberOfLines={1}
              >
                {place}
              </Text>
              {!!secondary && (
                <Text
                  className="text-[11px] text-content-muted"
                  numberOfLines={1}
                >
                  {secondary}
                </Text>
              )}
            </View>
          ) : (
            <View className="flex-1" />
          )}
          {!!place && (
            <View className="w-px self-stretch bg-line-strong my-2" />
          )}
          <View className="items-end py-2 pl-2.5 pr-3">
            <Text className="text-sm font-extrabold text-content">
              {when.primary}
            </Text>
            <Text className="text-[10px] text-content-muted">
              {when.secondary}
            </Text>
          </View>
        </View>
      </GlassSurface>
    </Pressable>
  )
}
