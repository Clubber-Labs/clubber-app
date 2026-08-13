import type { ReactNode } from 'react'
import { View } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { MAP_STYLE_URL } from '@/shared/theme'
import { useMapLightPreset } from '@/shared/hooks/useMapLightPreset'

type Props = {
  latitude: number
  longitude: number
  height?: number
  // Marcador (MarkerView/layer) de quem chama — o mapa não conhece domínio.
  children?: ReactNode
}

// Mini-mapa de um único lugar: mesma base e mesma luz do mapa principal.
export function LocationMap({
  latitude,
  longitude,
  height = 200,
  children,
}: Props) {
  const lightPreset = useMapLightPreset()
  return (
    <View style={{ height }} className="rounded-xl overflow-hidden">
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={MAP_STYLE_URL}
        scaleBarEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.StyleImport id="basemap" existing config={{ lightPreset }} />
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={[longitude, latitude]}
          animationMode="none"
        />
        {children}
      </Mapbox.MapView>
    </View>
  )
}
