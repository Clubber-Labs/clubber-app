import { View, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import Mapbox from '@rnmapbox/maps'
import type { Spot } from '../types'
import {
  SpotBalloon,
  SPOT_BALLOON_SIZE,
  SPOT_BALLOON_SIZE_SELECTED,
  SPOT_BALLOON_TAIL_ANCHOR,
} from './SpotBalloon'

type Props = {
  spots: Spot[]
  selectedId?: string
  onPress: (spot: Spot) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

const DIMMED_OPACITY = 0.5

export function SpotMarkers({ spots, selectedId, onPress, dimmed }: Props) {
  const { t } = useTranslation()
  return (
    <>
      {spots.map(spot => {
        const selected = selectedId === spot.id
        const size = selected ? SPOT_BALLOON_SIZE_SELECTED : SPOT_BALLOON_SIZE
        return (
          <Mapbox.MarkerView
            key={spot.id}
            id={`spot-${spot.id}`}
            coordinate={[spot.longitude, spot.latitude]}
            anchor={SPOT_BALLOON_TAIL_ANCHOR}
            allowOverlap
          >
            <View style={{ opacity: dimmed ? DIMMED_OPACITY : 1 }}>
              <Pressable
                onPress={() => onPress(spot)}
                accessibilityRole="button"
                accessibilityLabel={t('spots.markers.viewSpot', {
                  title: spot.title,
                })}
                hitSlop={6}
              >
                <SpotBalloon spot={spot} size={size} />
              </Pressable>
            </View>
          </Mapbox.MarkerView>
        )
      })}
    </>
  )
}
