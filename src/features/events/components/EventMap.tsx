import { View } from 'react-native'
import Mapbox from '@rnmapbox/maps'

type Props = {
  latitude: number
  longitude: number
  height?: number
}

export function EventMap({ latitude, longitude, height = 200 }: Props) {
  return (
    <View style={{ height }} className="rounded-2xl overflow-hidden">
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        scaleBarEnabled={false}
        compassEnabled={false}
      >
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={[longitude, latitude]}
          animationMode="none"
        />
        <Mapbox.PointAnnotation
          id="event-location"
          coordinate={[longitude, latitude]}
        >
          <View className="w-8 h-8 rounded-full bg-brand border-2 border-content" />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
    </View>
  )
}
