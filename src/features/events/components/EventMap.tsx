import { View } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { MAP_STYLE_URL } from '@/shared/theme'
import { useMapLightPreset } from '@/shared/hooks/useMapLightPreset'
import { LocationBalloonMarker } from './LocationBalloonMarker'
import { LocationDropMarker } from './LocationDropMarker'

type Props = {
  latitude: number
  longitude: number
  height?: number
  // Identidade do marcador: gota pra evento, balão de conversa pra rolê
  // (a tela de detalhe de spot reusa este mapa).
  marker?: 'event' | 'spot'
  // Categorias do evento — definem o emoji no miolo da gota.
  categories?: string[]
}

export function EventMap({
  latitude,
  longitude,
  height = 200,
  marker = 'event',
  categories,
}: Props) {
  const lightPreset = useMapLightPreset()
  return (
    <View style={{ height }} className="rounded-xl overflow-hidden">
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={MAP_STYLE_URL}
        scaleBarEnabled={false}
        compassEnabled={false}
      >
        <Mapbox.StyleImport id="basemap" existing config={{ lightPreset }} />
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={[longitude, latitude]}
          animationMode="none"
        />
        {marker === 'spot' ? (
          <LocationBalloonMarker
            id="event-location"
            coordinate={[longitude, latitude]}
          />
        ) : (
          <LocationDropMarker
            id="event-location"
            coordinate={[longitude, latitude]}
            categories={categories}
          />
        )}
      </Mapbox.MapView>
    </View>
  )
}
