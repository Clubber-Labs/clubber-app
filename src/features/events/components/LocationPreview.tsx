import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { InfoIcon } from 'phosphor-react-native'
import { colors, MAP_STYLE_URL } from '@/shared/theme'
import { useMapLightPreset } from '@/shared/hooks/useMapLightPreset'
import {
  EventPin,
  EVENT_PIN_SIZE,
  EVENT_PIN_TIP_ANCHOR,
} from '@/features/map/components/EventPin'
import { eventPinLook } from '@/features/map/utils/eventPinLook'

type Coords = { latitude: number; longitude: number }

type Props = {
  value: Coords | null
  initialCenter?: [number, number]
  hasError?: boolean
  // Categorias escolhidas no form — definem o emoji no miolo da gota.
  categories?: string[]
}

const DEFAULT_CENTER: [number, number] = [-46.6333, -23.5505]

// Mapa apenas informativo: reflete o local escolhido na busca acima. Sem
// interação — a localização vem sempre do campo de busca, nunca de tocar aqui.
export function LocationPreview({
  value,
  initialCenter = DEFAULT_CENTER,
  hasError,
  categories,
}: Props) {
  const [center, setCenter] = useState<[number, number]>(
    value ? [value.longitude, value.latitude] : initialCenter,
  )
  const lightPreset = useMapLightPreset()

  useEffect(() => {
    if (value) setCenter([value.longitude, value.latitude])
  }, [value?.latitude, value?.longitude])

  return (
    <View className="gap-2">
      <View
        className={`rounded-2xl overflow-hidden border ${hasError ? 'border-content' : 'border-line'}`}
        style={{ height: 240 }}
      >
        <Mapbox.MapView
          style={{ flex: 1 }}
          styleURL={MAP_STYLE_URL}
          scaleBarEnabled={false}
          compassEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Mapbox.StyleImport id="basemap" existing config={{ lightPreset }} />
          <Mapbox.Camera zoomLevel={13} centerCoordinate={center} />
          {value && (
            <Mapbox.MarkerView
              id="event-location"
              coordinate={[value.longitude, value.latitude]}
              anchor={EVENT_PIN_TIP_ANCHOR}
              allowOverlap
            >
              {/* Mesma gota do mapa: o autor vê no formulário o pin que o
                  evento vai ter lá. */}
              <EventPin
                {...eventPinLook({ categories: categories ?? [] })}
                size={EVENT_PIN_SIZE}
              />
            </Mapbox.MarkerView>
          )}
        </Mapbox.MapView>
      </View>

      <View className="flex-row items-center gap-1.5">
        <InfoIcon size={14} color={colors.contentMuted} />
        <Text className="text-xs text-content-muted">
          {value
            ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
            : 'Escolha um local no campo acima para ver no mapa'}
        </Text>
      </View>
    </View>
  )
}
