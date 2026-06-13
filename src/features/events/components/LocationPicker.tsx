import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Coords = { latitude: number; longitude: number }

type Props = {
  value: Coords | null
  onChange: (coords: Coords) => void
  initialCenter?: [number, number]
  hasError?: boolean
}

const DEFAULT_CENTER: [number, number] = [-46.6333, -23.5505]

export function LocationPicker({
  value,
  onChange,
  initialCenter = DEFAULT_CENTER,
  hasError,
}: Props) {
  const [center, setCenter] = useState<[number, number]>(
    value ? [value.longitude, value.latitude] : initialCenter,
  )

  useEffect(() => {
    if (value) setCenter([value.longitude, value.latitude])
  }, [value?.latitude, value?.longitude])

  function handlePress(feature: GeoJSON.Feature) {
    if (feature.geometry.type !== 'Point') return
    const [longitude, latitude] = feature.geometry.coordinates
    onChange({ latitude, longitude })
    setCenter([longitude, latitude])
  }

  return (
    <View className="gap-2">
      <View
        className={`rounded-2xl overflow-hidden border ${hasError ? 'border-content' : 'border-line'}`}
        style={{ height: 240 }}
      >
        <Mapbox.MapView
          style={{ flex: 1 }}
          styleURL="mapbox://styles/mapbox/streets-v12"
          onPress={handlePress}
          scaleBarEnabled={false}
          compassEnabled={false}
        >
          <Mapbox.Camera zoomLevel={13} centerCoordinate={center} />
          {value && (
            <Mapbox.PointAnnotation
              id="picked-location"
              coordinate={[value.longitude, value.latitude]}
            >
              <View className="w-8 h-8 rounded-full bg-brand border-2 border-content" />
            </Mapbox.PointAnnotation>
          )}
        </Mapbox.MapView>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={colors.contentMuted}
        />
        <Text className="text-xs text-content-muted">
          {value
            ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
            : 'Toque no mapa para escolher o local'}
        </Text>
      </View>
    </View>
  )
}
