import { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { useRouter } from 'expo-router'
import type { FeedEvent } from '@/shared/types'
import {
  ALL_CATEGORIES,
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
import { useUserLocation } from '@/features/map/hooks/useUserLocation'
import { useMapZoomState } from '@/features/map/hooks/useMapZoomState'
import { EventCategoriesFilter } from '@/features/map/components/EventCategoriesFilter'
import { MapZoomControls } from '@/features/map/components/MapZoomControls'
import { EventClustersLayer } from '@/features/map/components/EventClustersLayer'
import { EventMarkers } from '@/features/map/components/EventMarkers'
import { EventPreviewCard } from '@/features/map/components/EventPreviewCard'
import { MapStatusBanner } from '@/features/map/components/MapStatusBanner'

const COINCIDENT_FOCUS_ZOOM = 20

export default function MapScreen() {
  const router = useRouter()
  const { coords: userCoords } = useUserLocation()
  const { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent } = useMapCamera()
  const { showMarkers, onCameraZoomChange } = useMapZoomState()

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES)
  const [selectedEvent, setSelectedEvent] = useState<FeedEvent | null>(null)

  const shapeSourceRef = useRef<Mapbox.ShapeSource>(null)
  const { categories, filteredEvents, eventsGeoJson, isLoading, error } =
    useMapEvents(activeCategory)

  useEffect(() => {
    if (userCoords) flyTo(userCoords, USER_ZOOM, 800)
  }, [userCoords, flyTo])

  function handleMarkerPress(event: FeedEvent) {
    setSelectedEvent(event)
    focusOnEvent([event.longitude, event.latitude])
  }

  async function expandCluster(feature: GeoJSON.Feature) {
    if (feature.geometry.type !== 'Point') return
    const source = shapeSourceRef.current
    if (!source) return
    const [lng, lat] = feature.geometry.coordinates

    try {
      const expansionZoom = await source.getClusterExpansionZoom(feature)
      setSelectedEvent(null)
      // expansionZoom acima do nível de cluster = eventos coincidentes —
      // o fanout em EventMarkers cuida da separação visual
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
    const found = filteredEvents.find(e => e.id === eventId)
    if (found) handleMarkerPress(found)
  }

  return (
    <View className="flex-1 bg-black">
      <Mapbox.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MAP_STYLE_URL}
        scaleBarEnabled={false}
        compassEnabled={false}
        onPress={() => setSelectedEvent(null)}
        onCameraChanged={state => onCameraZoomChange(state.properties.zoom)}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={BRAZIL_ZOOM}
          centerCoordinate={BRAZIL_CENTER}
          animationMode="flyTo"
        />
        {!showMarkers && (
          <EventClustersLayer
            ref={shapeSourceRef}
            shape={eventsGeoJson}
            onPress={handleClusterShapePress}
          />
        )}
        {showMarkers && (
          <EventMarkers
            events={filteredEvents}
            selectedId={selectedEvent?.id}
            onPress={handleMarkerPress}
          />
        )}
      </Mapbox.MapView>

      <View className="absolute top-3 left-0 right-0">
        <EventCategoriesFilter
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </View>

      {isLoading && !error && (
        <View className="absolute top-16 self-center bg-zinc-900/90 px-3 py-1.5 rounded-full border border-zinc-800">
          <ActivityIndicator size="small" color="#8b5cf6" />
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
        onRecenter={() => userCoords && flyTo(userCoords, USER_ZOOM, 600)}
        showRecenter={!!userCoords}
      />

      {selectedEvent && (
        <EventPreviewCard
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSeeDetails={() => router.push(`/events/${selectedEvent.id}`)}
        />
      )}
    </View>
  )
}
