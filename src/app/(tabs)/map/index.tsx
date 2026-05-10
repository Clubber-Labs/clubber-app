import { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { useRouter } from 'expo-router'
import type { EventStatus, FeedEvent } from '@/shared/types'
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
import { useHeatmap } from '@/features/map/hooks/useHeatmap'
import type { Bbox } from '@/features/map/services/mapService'
import { EventCategoriesFilter } from '@/features/map/components/EventCategoriesFilter'
import { MapZoomControls } from '@/features/map/components/MapZoomControls'
import { EventClustersLayer } from '@/features/map/components/EventClustersLayer'
import { EventHeatmapLayer } from '@/features/map/components/EventHeatmapLayer'
import { EventMarkers } from '@/features/map/components/EventMarkers'
import { EventPreviewCard } from '@/features/map/components/EventPreviewCard'
import { MapStatusBanner } from '@/features/map/components/MapStatusBanner'
import { FloatingCreateButton } from '@/features/events/components/FloatingCreateButton'
import { EventStatusFilter } from '@/features/events/components/EventStatusFilter'

const HEATMAP_BBOX_DEBOUNCE_MS = 300

const COINCIDENT_FOCUS_ZOOM = 20

export default function MapScreen() {
  const router = useRouter()
  const { coords: userCoords } = useUserLocation()
  const { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent } = useMapCamera()
  const { showMarkers, onCameraZoomChange } = useMapZoomState()

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES)
  const [statusFilter, setStatusFilter] = useState<EventStatus[]>([])
  const [selectedEvent, setSelectedEvent] = useState<FeedEvent | null>(null)
  const [heatmapMode, setHeatmapMode] = useState(false)
  const [heatmapBbox, setHeatmapBbox] = useState<Bbox | null>(null)
  const bboxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Token incrementado a cada toggle/unmount; captureBbox descarta resultado
  // se a versão mudou enquanto getVisibleBounds estava resolvendo (evita
  // setState com bbox stale após desativar modo heatmap ou desmontar).
  const heatmapVersionRef = useRef(0)

  const shapeSourceRef = useRef<Mapbox.ShapeSource>(null)
  const { categories, filteredEvents, eventsGeoJson, isLoading, error } =
    useMapEvents(activeCategory, statusFilter)

  const heatmapFilters = {
    status: statusFilter.length ? statusFilter : undefined,
    category:
      activeCategory !== ALL_CATEGORIES ? [activeCategory] : undefined,
  }
  const { data: heatmapPoints = [] } = useHeatmap(
    heatmapBbox,
    heatmapFilters,
    heatmapMode,
  )

  function clearBboxTimer() {
    if (bboxTimerRef.current) {
      clearTimeout(bboxTimerRef.current)
      bboxTimerRef.current = null
    }
  }

  async function captureBbox(token: number) {
    try {
      const bounds = await mapRef.current?.getVisibleBounds()
      if (!bounds) return
      // Descarta se o token expirou (toggle off, unmount, novo toggle on)
      if (heatmapVersionRef.current !== token) return
      const [[east, north], [west, south]] = bounds
      setHeatmapBbox({
        bboxNorth: north,
        bboxSouth: south,
        bboxEast: east,
        bboxWest: west,
      })
    } catch {
      // MapView ainda não montou ou falha nativa — ignora silenciosamente
    }
  }

  // Debounce do bbox: arrastar o mapa não pode floodar o backend. Quando o
  // user para de mover por 300ms, atualiza o bbox e a queryKey muda.
  function scheduleBboxUpdate() {
    if (!heatmapMode) return
    clearBboxTimer()
    const token = heatmapVersionRef.current
    bboxTimerRef.current = setTimeout(
      () => captureBbox(token),
      HEATMAP_BBOX_DEBOUNCE_MS,
    )
  }

  function toggleHeatmap() {
    setHeatmapMode(prev => {
      const next = !prev
      // Invalida qualquer captureBbox em voo (resolverá fora do token atual)
      heatmapVersionRef.current++
      if (next) {
        // Ativando: captura imediata sem debounce
        captureBbox(heatmapVersionRef.current)
      } else {
        // Desativando: cancela timer pendente e zera bbox
        clearBboxTimer()
        setHeatmapBbox(null)
      }
      return next
    })
  }

  // Limpa timer e invalida promises pendentes no unmount
  useEffect(
    () => () => {
      heatmapVersionRef.current++
      clearBboxTimer()
    },
    [],
  )

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
      // expansionZoom > nível de cluster = coincidentes; fanout separa visual
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
        logoEnabled={false}
        attributionEnabled={false}
        onPress={() => setSelectedEvent(null)}
        onCameraChanged={state => {
          onCameraZoomChange(state.properties.zoom)
          scheduleBboxUpdate()
        }}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={BRAZIL_ZOOM}
          centerCoordinate={BRAZIL_CENTER}
          animationMode="flyTo"
        />
        {heatmapMode ? (
          <EventHeatmapLayer points={heatmapPoints} />
        ) : !showMarkers ? (
          <EventClustersLayer
            ref={shapeSourceRef}
            shape={eventsGeoJson}
            onPress={handleClusterShapePress}
          />
        ) : (
          <EventMarkers
            events={filteredEvents}
            selectedId={selectedEvent?.id}
            onPress={handleMarkerPress}
          />
        )}
      </Mapbox.MapView>

      <View className="absolute top-3 left-0 right-0 gap-2">
        <EventCategoriesFilter
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
        <EventStatusFilter value={statusFilter} onChange={setStatusFilter} />
      </View>

      {isLoading && !error && (
        <View className="absolute top-28 self-center bg-zinc-900/90 px-3 py-1.5 rounded-full border border-zinc-800">
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
        heatmapActive={heatmapMode}
        onToggleHeatmap={toggleHeatmap}
      />

      {!selectedEvent && <FloatingCreateButton />}

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
