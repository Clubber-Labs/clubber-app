import { useEffect, useRef, useState } from 'react'
import { View, Text, ActivityIndicator, Keyboard, Linking } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { useRouter } from 'expo-router'
import type { FeedEvent } from '@/shared/types'
import {
  BRAZIL_CENTER,
  BRAZIL_ZOOM,
  CLUSTER_MAX_ZOOM,
  MAP_STYLE_URL,
  MAX_ZOOM,
  USER_ZOOM,
  ZOOM_STEP,
} from '@/features/map/constants'
import { useMapEvents } from '@/features/map/hooks/useMapEvents'
import { useMapCamera } from '@/features/map/hooks/useMapCamera'
import { useUserLocation } from '@/shared/hooks/useUserLocation'
import { useUserLiveLocation } from '@/shared/hooks/useUserLiveLocation'
import { useBanner } from '@/shared/lib/banner'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { UserLocationLayer } from '@/features/map/components/UserLocationLayer'
import { useMapZoomState } from '@/features/map/hooks/useMapZoomState'
import { useHeatmap } from '@/features/map/hooks/useHeatmap'
import { useViewportBbox } from '@/features/map/hooks/useViewportBbox'
import { useMapUiStore } from '@/features/map/store/mapUiStore'
import { MapZoomControls } from '@/features/map/components/MapZoomControls'
import { EventClustersLayer } from '@/features/map/components/EventClustersLayer'
import { EventHeatmapLayer } from '@/features/map/components/EventHeatmapLayer'
import { EventMarkers } from '@/features/map/components/EventMarkers'
import { EventPreviewCard } from '@/features/map/components/EventPreviewCard'
import { MapStatusBanner } from '@/features/map/components/MapStatusBanner'
import { MapSearchBar } from '@/features/map/components/MapSearchBar'
import { MapFiltersSheet } from '@/features/map/components/MapFiltersSheet'
import { FloatingCreateButton } from '@/features/events/components/FloatingCreateButton'

const COINCIDENT_FOCUS_ZOOM = 20

export default function MapScreen() {
  const router = useRouter()
  const { coords: userCoords, status: locationStatus } = useUserLocation()
  const livePos = useUserLiveLocation(locationStatus === 'ready')
  const myPos = livePos ?? userCoords
  const profile = useMyProfile()
  const { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent } = useMapCamera()
  const { showMarkers, onCameraZoomChange } = useMapZoomState()
  const { bbox, onRegionChange } = useViewportBbox(mapRef)

  const filters = useMapUiStore(s => s.filters)
  const showBanner = useBanner()

  const [selectedEvent, setSelectedEvent] = useState<FeedEvent | null>(null)
  const [densityVisible, setDensityVisible] = useState(false)

  const shapeSourceRef = useRef<Mapbox.ShapeSource>(null)

  const { events, eventsGeoJson, truncated, isLoading, error } = useMapEvents(
    bbox,
    filters,
  )
  const { data: heatmapPoints = [] } = useHeatmap(bbox, filters, densityVisible)

  useEffect(() => {
    if (userCoords) flyTo(userCoords, USER_ZOOM, 800)
  }, [userCoords, flyTo])

  // Abre o preview e aproxima — vale pra tap no pin e pra resultado de busca
  // (que pode estar fora do viewport; o flyTo dispara o refetch por bbox).
  function openEvent(event: FeedEvent) {
    setSelectedEvent(event)
    focusOnEvent([event.longitude, event.latitude])
  }

  // Centraliza na posição ATUAL (live), com fallback pro fix inicial; sem coords,
  // orienta conforme o estado da permissão.
  function recenter() {
    if (myPos) {
      flyTo(myPos, USER_ZOOM, 600)
    } else if (locationStatus === 'denied') {
      showBanner('Ative a localização nos ajustes para ver você no mapa.')
      Linking.openSettings()
    } else if (locationStatus === 'error') {
      showBanner('Não foi possível obter sua localização.')
    }
  }

  async function expandCluster(feature: GeoJSON.Feature) {
    if (feature.geometry.type !== 'Point') return
    const source = shapeSourceRef.current
    if (!source) return
    const [lng, lat] = feature.geometry.coordinates

    try {
      const expansionZoom = await source.getClusterExpansionZoom(feature)
      setSelectedEvent(null)
      const targetZoom =
        expansionZoom > CLUSTER_MAX_ZOOM
          ? COINCIDENT_FOCUS_ZOOM
          : Math.min(expansionZoom + 0.5, MAX_ZOOM)
      flyTo([lng, lat], targetZoom, 600)
    } catch {
      focusOnEvent([lng, lat])
    }
  }

  function handleClusterShapePress(event: { features: GeoJSON.Feature[] }) {
    const feature = event.features[0]
    if (!feature) return
    const props = feature.properties as Record<string, unknown> | null
    if (props?.cluster) {
      expandCluster(feature)
      return
    }
    const eventId = props?.eventId as string | undefined
    const found = events.find(e => e.id === eventId)
    if (found) openEvent(found)
  }

  return (
    <View className="flex-1 bg-black">
      <Mapbox.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MAP_STYLE_URL}
        scaleBarEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onPress={() => {
          Keyboard.dismiss()
          setSelectedEvent(null)
        }}
        // onMapIdle dispara quando o mapa estabiliza (load inicial + fim de cada
        // movimento) — captura confiável do bbox. onCameraChanged reforça (e
        // mantém o threshold de zoom). Ambos passam pelo mesmo debounce.
        onMapIdle={onRegionChange}
        onCameraChanged={state => {
          // Qualquer movimento (pan/zoom/botões) fecha o teclado da busca.
          Keyboard.dismiss()
          onCameraZoomChange(state.properties.zoom)
          onRegionChange()
        }}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={BRAZIL_ZOOM}
          centerCoordinate={BRAZIL_CENTER}
          animationMode="flyTo"
        />
        {/* Densidade ao fundo + indicador do usuário, ambos abaixo dos pins. */}
        {densityVisible && <EventHeatmapLayer points={heatmapPoints} />}
        {/* Indicador de posição como STYLE LAYER (não MarkerView): style layer
            NUNCA captura toque e fica abaixo dos pins — então nunca bloqueia a
            interação com eles (o MarkerView bloqueava, mesmo com pointerEvents). */}
        {locationStatus === 'ready' && myPos && (
          <UserLocationLayer
            coordinate={myPos}
            avatarUrl={profile.data?.avatarUrl}
          />
        )}
        {!showMarkers ? (
          <EventClustersLayer
            ref={shapeSourceRef}
            shape={eventsGeoJson}
            onPress={handleClusterShapePress}
            dimmed={densityVisible}
          />
        ) : (
          <EventMarkers
            events={events}
            selectedId={selectedEvent?.id}
            onPress={openEvent}
            dimmed={densityVisible}
          />
        )}
      </Mapbox.MapView>

      <View className="absolute top-3 left-3 right-3">
        <MapSearchBar onSelect={openEvent} />
      </View>

      {isLoading && !error && (
        <View className="absolute top-24 self-center bg-zinc-900/90 px-3 py-1.5 rounded-full border border-zinc-800">
          <ActivityIndicator size="small" color="#8b5cf6" />
        </View>
      )}

      {!isLoading && truncated && !error && (
        <View className="absolute top-24 self-center bg-zinc-900/90 px-3 py-1.5 rounded-full border border-zinc-800">
          <Text className="text-zinc-300 text-xs">
            Aproxime para ver mais eventos
          </Text>
        </View>
      )}

      {error && (
        <MapStatusBanner
          variant="error"
          message="Não foi possível carregar os eventos."
        />
      )}

      <MapZoomControls
        onZoomIn={() => adjustZoom(ZOOM_STEP)}
        onZoomOut={() => adjustZoom(-ZOOM_STEP)}
        onRecenter={recenter}
        showRecenter
        densityActive={densityVisible}
        onToggleDensity={() => setDensityVisible(v => !v)}
      />

      {!selectedEvent && <FloatingCreateButton />}

      {selectedEvent && (
        <EventPreviewCard
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSeeDetails={() => router.push(`/events/${selectedEvent.id}`)}
        />
      )}

      <MapFiltersSheet />
    </View>
  )
}
