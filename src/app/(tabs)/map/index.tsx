import { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { useRouter } from 'expo-router'
import type { FeedEvent } from '@/shared/types'
import {
  ALL_CATEGORIES,
  BRAZIL_CENTER,
  BRAZIL_ZOOM,
  MAP_STYLE_URL,
  MARKERS_ZOOM_THRESHOLD,
  MAX_ZOOM,
  USER_ZOOM,
  ZOOM_STEP,
} from '@/features/map/constants'
import { useMapEvents } from '@/features/map/hooks/useMapEvents'
import { useMapCamera } from '@/features/map/hooks/useMapCamera'
import { useUserLocation } from '@/features/map/hooks/useUserLocation'
import { computeClusterZoom } from '@/features/map/utils/clusterZoom'
import { EventCategoriesFilter } from '@/features/map/components/EventCategoriesFilter'
import { MapZoomControls } from '@/features/map/components/MapZoomControls'
import { EventClustersLayer } from '@/features/map/components/EventClustersLayer'
import { EventMarkers } from '@/features/map/components/EventMarkers'
import { EventClusterList } from '@/features/map/components/EventClusterList'
import { EventPreviewCard } from '@/features/map/components/EventPreviewCard'

export default function MapScreen() {
  const router = useRouter()
  const userCoords = useUserLocation()
  const { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent } = useMapCamera()

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES)
  const [zoomLevel, setZoomLevel] = useState<number>(BRAZIL_ZOOM)
  const [selectedEvent, setSelectedEvent] = useState<FeedEvent | null>(null)
  const [clusterEvents, setClusterEvents] = useState<FeedEvent[] | null>(null)

  const shapeSourceRef = useRef<Mapbox.ShapeSource>(null)
  const { categories, filteredEvents, eventsGeoJson, isLoading } =
    useMapEvents(activeCategory)

  const showMarkers = zoomLevel >= MARKERS_ZOOM_THRESHOLD

  useEffect(() => {
    setClusterEvents(null)
  }, [activeCategory])

  useEffect(() => {
    if (userCoords) flyTo(userCoords, USER_ZOOM, 800)
  }, [userCoords, flyTo])

  function handleMarkerPress(event: FeedEvent) {
    setSelectedEvent(event)
    focusOnEvent([event.longitude, event.latitude])
  }

  async function openClusterList(feature: GeoJSON.Feature) {
    if (feature.geometry.type !== 'Point') return
    const source = shapeSourceRef.current
    if (!source) return
    const [lng, lat] = feature.geometry.coordinates
    try {
      const leaves = (await source.getClusterLeaves(
        feature,
        100,
        0,
      )) as GeoJSON.FeatureCollection
      const ids = (leaves.features ?? [])
        .map(
          (f: GeoJSON.Feature) =>
            (f.properties as { eventId?: string } | null)?.eventId,
        )
        .filter((id: string | undefined): id is string => !!id)
      const found = ids
        .map((id: string) => filteredEvents.find(e => e.id === id))
        .filter((e: FeedEvent | undefined): e is FeedEvent => !!e)
      if (found.length === 0) return

      setSelectedEvent(null)
      setClusterEvents(found)
      flyTo([lng, lat], computeClusterZoom(found, [lng, lat], zoomLevel), 600)
    } catch {
      flyTo([lng, lat], Math.min(zoomLevel + 2, MAX_ZOOM), 500)
    }
  }

  function handleClusterShapePress(event: { features: GeoJSON.Feature[] }) {
    const feature = event.features[0]
    if (!feature) return
    const props = feature.properties as Record<string, unknown> | null
    if (props?.cluster) {
      openClusterList(feature)
      return
    }
    const eventId = props?.eventId as string | undefined
    const found = filteredEvents.find(e => e.id === eventId)
    if (found) {
      setClusterEvents(null)
      handleMarkerPress(found)
    }
  }

  function handleClusterItemPress(event: FeedEvent) {
    setClusterEvents(null)
    focusOnEvent([event.longitude, event.latitude])
    router.push(`/events/${event.id}`)
  }

  function dismissOverlays() {
    setSelectedEvent(null)
    setClusterEvents(null)
  }

  return (
    <View className="flex-1 bg-black">
      <Mapbox.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MAP_STYLE_URL}
        scaleBarEnabled={false}
        compassEnabled={false}
        onPress={dismissOverlays}
        onCameraChanged={state => setZoomLevel(state.properties.zoom)}
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

      {isLoading && (
        <View className="absolute top-16 self-center bg-zinc-900/90 px-3 py-1.5 rounded-full border border-zinc-800">
          <ActivityIndicator size="small" color="#8b5cf6" />
        </View>
      )}

      <MapZoomControls
        onZoomIn={() => adjustZoom(ZOOM_STEP)}
        onZoomOut={() => adjustZoom(-ZOOM_STEP)}
        onRecenter={() => userCoords && flyTo(userCoords, USER_ZOOM, 600)}
        showRecenter={!!userCoords}
      />

      {clusterEvents && (
        <EventClusterList
          events={clusterEvents}
          onClose={() => setClusterEvents(null)}
          onSelect={handleClusterItemPress}
        />
      )}

      {selectedEvent && !clusterEvents && (
        <EventPreviewCard
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSeeDetails={() => router.push(`/events/${selectedEvent.id}`)}
        />
      )}
    </View>
  )
}
