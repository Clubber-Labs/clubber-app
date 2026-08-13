import Mapbox from '@rnmapbox/maps'
import { LocationMap } from '@/shared/components/LocationMap'
import {
  SpotBalloon,
  SPOT_BALLOON_SIZE,
  SPOT_BALLOON_TAIL_ANCHOR,
} from './SpotBalloon'
import type { Spot } from '../types'

type Props = {
  spot: Spot
  height?: number
}

// Local do rolê na tela de detalhe: o MESMO balão do mapa principal (foto do
// criador, badge de membros, espectro enquanto está rolando).
export function SpotLocationMap({ spot, height }: Props) {
  return (
    <LocationMap
      latitude={spot.latitude}
      longitude={spot.longitude}
      height={height}
    >
      <Mapbox.MarkerView
        id="spot-location"
        coordinate={[spot.longitude, spot.latitude]}
        anchor={SPOT_BALLOON_TAIL_ANCHOR}
        allowOverlap
      >
        <SpotBalloon spot={spot} size={SPOT_BALLOON_SIZE} />
      </Mapbox.MarkerView>
    </LocationMap>
  )
}
