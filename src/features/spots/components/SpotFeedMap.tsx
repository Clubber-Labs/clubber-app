import { useState } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { LockIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { LivePill } from '@/shared/components/LivePill'
import { useSpotSnapshot } from '../hooks/useSpotSnapshot'
import {
  SpotBalloon,
  SPOT_BALLOON_CANVAS,
  SPOT_BALLOON_SIZE,
  SPOT_BALLOON_TAIL_ANCHOR,
} from './SpotBalloon'
import { SpotMapPlaceholder } from './SpotMapPlaceholder'
import { SpotRouteTrail } from './SpotRouteTrail'
import { SpotWindowBar } from './SpotWindowBar'
import { SpotFeedMenu } from './SpotFeedMenu'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  spot: Spot
  live: boolean
  isCreator: boolean
  userCoords: [number, number] | null
  onOpenMaps: () => void
}

export const SPOT_FEED_MAP_HEIGHT = 190

/**
 * Capa do card: o lugar do rolê como mini-mapa. O mapa é um PNG estático — um
 * MapView por card derrubaria o scroll do feed —, e o balão fica POR CIMA dele
 * como view, não rasterizado: é o mesmo componente do mapa principal, com foto
 * do criador e contagem de membros ao vivo.
 */
export function SpotFeedMap({
  spot,
  live,
  isCreator,
  userCoords,
  onOpenMaps,
}: Props) {
  const { t } = useTranslation()
  const [width, setWidth] = useState<number | null>(null)
  const { uri, onImageError } = useSpotSnapshot({
    placeId: spot.placeId,
    latitude: spot.latitude,
    longitude: spot.longitude,
    width,
    height: SPOT_FEED_MAP_HEIGHT,
  })

  // O snapshot é centrado no rolê: a ponta do rabinho pousa no centro da caixa.
  const center = { x: (width ?? 0) / 2, y: SPOT_FEED_MAP_HEIGHT / 2 }

  return (
    <View
      className="overflow-hidden bg-surface-sunken"
      style={{ height: SPOT_FEED_MAP_HEIGHT }}
      onLayout={e => {
        const measured = Math.round(e.nativeEvent.layout.width)
        setWidth(prev => (prev === measured ? prev : measured))
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={onImageError}
        />
      ) : (
        <SpotMapPlaceholder />
      )}

      {!!width && !!userCoords && (
        <SpotRouteTrail
          width={width}
          height={SPOT_FEED_MAP_HEIGHT}
          target={center}
        />
      )}

      {!!width && (
        <View
          style={{
            position: 'absolute',
            left:
              center.x - SPOT_BALLOON_TAIL_ANCHOR.x * SPOT_BALLOON_CANVAS.width,
            top:
              center.y -
              SPOT_BALLOON_TAIL_ANCHOR.y * SPOT_BALLOON_CANVAS.height,
          }}
        >
          <SpotBalloon spot={spot} size={SPOT_BALLOON_SIZE} />
        </View>
      )}

      <View className="absolute inset-x-3 top-3 flex-row items-start gap-2">
        <View className="flex-1 flex-row">
          {live ? (
            <LivePill label={t('spots.feedCard.now')} />
          ) : (
            spot.visibility === 'FRIENDS' && (
              <View className="flex-row items-center gap-1 self-start rounded-full border border-white/15 bg-background/70 px-2.5 py-1">
                <LockIcon size={11} color={colors.contentTertiary} />
                <Text className="text-[11px] font-semibold text-content-tertiary">
                  {t('spots.feedCard.friendsOnly')}
                </Text>
              </View>
            )
          )}
        </View>
        <SpotFeedMenu spot={spot} isCreator={isCreator} />
      </View>

      <SpotWindowBar
        spot={spot}
        live={live}
        userCoords={userCoords}
        onPress={onOpenMaps}
      />
    </View>
  )
}
