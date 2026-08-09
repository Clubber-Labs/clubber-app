import { useEffect, useRef, useState } from 'react'
import { View, Text, ActivityIndicator, Keyboard, Linking } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { FeedEvent } from '@/shared/types'
import {
  BRAZIL_CENTER,
  BRAZIL_ZOOM,
  MAP_STYLE_URL,
  MAX_ZOOM,
  USER_ZOOM,
  ZOOM_STEP,
} from '@/features/map/constants'
import { useMapEvents } from '@/features/map/hooks/useMapEvents'
import {
  useEventClusters,
  type EventCluster,
} from '@/features/map/hooks/useEventClusters'
import { useMapCamera } from '@/features/map/hooks/useMapCamera'
import { useUserLocation } from '@/shared/hooks/useUserLocation'
import { useUserLiveLocation } from '@/shared/hooks/useUserLiveLocation'
import { useMapLightPreset } from '@/shared/hooks/useMapLightPreset'
import { useBanner } from '@/shared/lib/banner'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { UserLocationLayer } from '@/features/map/components/UserLocationLayer'
import { UserAvatarIconCapture } from '@/features/map/components/UserAvatarIconCapture'
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
import { MapCategoryChips } from '@/features/map/components/MapCategoryChips'
import { MapFiltersSheet } from '@/features/map/components/MapFiltersSheet'
import { MapCreateButton } from '@/features/map/components/MapCreateButton'
import { useViewportSpots } from '@/features/spots/hooks/useViewportSpots'
import { useSuggestSpots } from '@/features/spots/hooks/useSuggestSpots'
import { SpotMarkers } from '@/features/spots/components/SpotMarkers'
import { SpotBalloonLayer } from '@/features/spots/components/SpotBalloonLayer'
import { SpotPreviewCard } from '@/features/spots/components/SpotPreviewCard'
import { SpotSuggestionsPanel } from '@/features/spots/components/SpotSuggestionsPanel'
import { SuggestionMarkers } from '@/features/spots/components/SuggestionMarkers'
import type { Spot, SpotSuggestion } from '@/features/spots/types'
import { colors } from '@/shared/theme'

export default function MapScreen() {
  const router = useRouter()
  // Pedido de foco vindo de fora (ex.: "Ver no mapa" pós-publicação de spot).
  const { focusSpotId, focusLat, focusLng } = useLocalSearchParams<{
    focusSpotId?: string
    focusLat?: string
    focusLng?: string
  }>()
  const { coords: userCoords, status: locationStatus } = useUserLocation()
  const livePos = useUserLiveLocation(locationStatus === 'ready')
  const myPos = livePos ?? userCoords
  const profile = useMyProfile()
  const { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent, fitToCoords } =
    useMapCamera()
  const { showMarkers, zoomBucket, onCameraZoomChange } = useMapZoomState()
  const { bbox, onRegionChange } = useViewportBbox(mapRef)

  const filters = useMapUiStore(s => s.filters)
  const showBanner = useBanner()
  const lightPreset = useMapLightPreset()

  const [selectedEvent, setSelectedEvent] = useState<FeedEvent | null>(null)
  const [avatarIconUri, setAvatarIconUri] = useState<string | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [densityVisible, setDensityVisible] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  // O fluxo de gerar vive aqui (não no painel) pra fechar/reabrir o painel
  // sem perder as sugestões já geradas — reabrir não gasta outra geração.
  const suggest = useSuggestSpots()

  const { events, truncated, isLoading, error } = useMapEvents(bbox, filters)
  // Clusterização em JS: agrupados viram badges nativos; os que sobram são
  // MarkerViews completos (emoji + confirmados) em qualquer zoom.
  const { clusters, singles } = useEventClusters(events, zoomBucket)
  // Spots sempre visíveis, sem o gate de zoom dos pins de evento: o zoom
  // padrão (USER_ZOOM) fica abaixo do threshold e esconderia os balões. O
  // volume é baixo (máx. 5 ativos por usuário, vida de 24h) — não clusteriza.
  const { data: spots = [] } = useViewportSpots(bbox, {
    categories: filters.categories,
    friendsOnly: filters.friendsOnly,
  })
  const { data: heatmapPoints = [] } = useHeatmap(bbox, filters, densityVisible)

  // Voa até o pedido de foco e o APAGA da rota: param grudado na tab
  // bloquearia o recentro automático pra sempre e impediria um segundo
  // pedido pro mesmo rolê. Limpa com string vazia (não undefined) porque
  // "undefined" serializado viraria coordenada NaN no próximo ciclo.
  const focusConsumedRef = useRef(false)
  const [spotToOpen, setSpotToOpen] = useState<string | null>(null)
  useEffect(() => {
    if (!focusLat || !focusLng) return
    focusConsumedRef.current = true
    focusOnEvent([Number(focusLng), Number(focusLat)])
    if (focusSpotId) setSpotToOpen(focusSpotId)
    router.setParams({ focusSpotId: '', focusLat: '', focusLng: '' })
  }, [focusSpotId, focusLat, focusLng, focusOnEvent, router])

  // Recentro automático só sem foco pedido — o fix de GPS chega depois do
  // voo e roubaria a câmera (o ref cobre a janela após limpar os params).
  useEffect(() => {
    if (!userCoords || focusLat || focusConsumedRef.current) return
    flyTo(userCoords, USER_ZOOM, 800)
  }, [userCoords, flyTo, focusLat])

  // O card do rolê abre quando os spots do viewport incluírem o focado.
  useEffect(() => {
    if (!spotToOpen) return
    const found = spots.find(spot => spot.id === spotToOpen)
    if (!found) return
    setSpotToOpen(null)
    setSelectedEvent(null)
    setSelectedSpot(found)
  }, [spotToOpen, spots])

  // Sugestões geradas → enquadra os rascunhos na metade visível do mapa (o
  // padding inferior do fitToCoords compensa o painel aberto por cima).
  const suggestions = suggest.suggestions
  useEffect(() => {
    if (!suggestionsOpen || suggestions.length === 0) return
    fitToCoords(suggestions.map(s => [s.longitude, s.latitude]))
  }, [suggestionsOpen, suggestions, fitToCoords])

  function chooseSuggestion(suggestion: SpotSuggestion) {
    // Candidatos são efêmeros (não persistem no backend) — seguem por
    // parâmetro de rota até o form de publicação.
    router.push({
      pathname: '/spots/publish',
      params: { candidate: JSON.stringify(suggestion) },
    })
  }

  // Abre o preview e aproxima — vale pra tap no pin e pra resultado de busca
  // (que pode estar fora do viewport; o flyTo dispara o refetch por bbox).
  function openEvent(event: FeedEvent) {
    setSelectedSpot(null)
    setSelectedEvent(event)
    focusOnEvent([event.longitude, event.latitude])
  }

  function openSpot(spot: Spot) {
    setSelectedEvent(null)
    setSelectedSpot(spot)
    focusOnEvent([spot.longitude, spot.latitude])
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

  function expandCluster(cluster: EventCluster) {
    setSelectedEvent(null)
    flyTo(
      cluster.coordinate,
      Math.min(cluster.expansionZoom + 0.5, MAX_ZOOM),
      600,
    )
  }

  return (
    <View className="flex-1 bg-background">
      {/* Antes do MapView de propósito: fica coberto pelo mapa (invisível),
          mas on-screen — condição pra foto carregar e a captura funcionar. */}
      <UserAvatarIconCapture
        avatarUrl={profile.data?.avatarUrl}
        onCaptured={setAvatarIconUri}
      />
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
          setSelectedSpot(null)
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
        {/* Luz do Standard acompanha a hora local (dia/tarde/noite). */}
        <Mapbox.StyleImport id="basemap" existing config={{ lightPreset }} />
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
          <UserLocationLayer coordinate={myPos} avatarIconUri={avatarIconUri} />
        )}
        {/* Mini-balões de spot ANTES dos badges: ambos style layers, a ordem
            de montagem deixa os eventos por cima. MarkerViews (pins e balões
            completos) ficam acima de qualquer layer por natureza. */}
        {!showMarkers && (
          <SpotBalloonLayer
            spots={spots}
            onPress={openSpot}
            dimmed={densityVisible}
          />
        )}
        <EventClustersLayer
          clusters={clusters}
          onPress={expandCluster}
          dimmed={densityVisible}
        />
        <EventMarkers
          events={singles}
          selectedId={selectedEvent?.id}
          onPress={openEvent}
          dimmed={densityVisible}
          detailsOpen={!!selectedEvent || !!selectedSpot}
        />
        {showMarkers && (
          <SpotMarkers
            spots={spots}
            selectedId={selectedSpot?.id}
            onPress={openSpot}
            dimmed={densityVisible}
          />
        )}
        {suggestionsOpen && (
          <SuggestionMarkers
            suggestions={suggest.suggestions}
            onPress={chooseSuggestion}
          />
        )}
      </Mapbox.MapView>

      <View
        className="absolute top-3 left-0 right-0 gap-2"
        pointerEvents="box-none"
      >
        <View className="px-3">
          <MapSearchBar onSelect={openEvent} />
        </View>
        <MapCategoryChips />
      </View>

      {isLoading && !error && (
        <View className="absolute top-24 self-center bg-surface/90 px-3 py-1.5 rounded-lg border border-line-strong">
          <ActivityIndicator size="small" color={colors.brandEmphasis} />
        </View>
      )}

      {!isLoading && truncated && !error && (
        <View className="absolute top-24 self-center bg-surface/90 px-3 py-1.5 rounded-lg border border-line-strong">
          <Text className="text-content-tertiary text-xs">
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

      {!selectedEvent && !selectedSpot && !suggestionsOpen && (
        <>
          <MapZoomControls
            onZoomIn={() => adjustZoom(ZOOM_STEP)}
            onZoomOut={() => adjustZoom(-ZOOM_STEP)}
            onRecenter={recenter}
            showRecenter
            densityActive={densityVisible}
            onToggleDensity={() => setDensityVisible(v => !v)}
          />
          <MapCreateButton
            onCreateEvent={() => router.push('/events/create')}
            onCreateSpot={() => setSuggestionsOpen(true)}
          />
        </>
      )}

      {suggestionsOpen && (
        <SpotSuggestionsPanel
          suggest={suggest}
          onChoose={chooseSuggestion}
          onClose={() => setSuggestionsOpen(false)}
        />
      )}

      {selectedEvent && (
        <EventPreviewCard
          event={selectedEvent}
          userCoords={myPos}
          onClose={() => setSelectedEvent(null)}
          onSeeDetails={() => router.push(`/events/${selectedEvent.id}`)}
        />
      )}

      {selectedSpot && (
        <SpotPreviewCard
          spot={selectedSpot}
          userCoords={myPos}
          onClose={() => setSelectedSpot(null)}
          onSeeDetails={() => router.push(`/spots/${selectedSpot.id}`)}
        />
      )}

      <MapFiltersSheet />
    </View>
  )
}
