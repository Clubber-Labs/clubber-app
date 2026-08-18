import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useLocationGate } from '@/features/privacy/hooks/useLocationGate'
import { useUserLiveLocation } from '@/shared/hooks/useUserLiveLocation'
import { useMapLightPreset } from '@/shared/hooks/useMapLightPreset'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
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
import { LocationInviteCard } from '@/features/map/components/LocationInviteCard'
import { useLocationInvite } from '@/features/map/hooks/useLocationInvite'
import { MapStatusBanner } from '@/features/map/components/MapStatusBanner'
import { GpsSlashIcon } from 'phosphor-react-native'
import { MapSearchBar } from '@/features/map/components/MapSearchBar'
import { MapCategoryChips } from '@/features/map/components/MapCategoryChips'
import { MapFiltersSheet } from '@/features/map/components/MapFiltersSheet'
import { CreateFab } from '@/shared/components/CreateFab'
import { useViewportSpots } from '@/features/spots/hooks/useViewportSpots'
import { useSuggestSpots } from '@/features/spots/hooks/useSuggestSpots'
import { SpotMarkers } from '@/features/spots/components/SpotMarkers'
import { SpotPreviewCard } from '@/features/spots/components/SpotPreviewCard'
import { SpotSuggestionsPanel } from '@/features/spots/components/SpotSuggestionsPanel'
import { SuggestionMarkers } from '@/features/spots/components/SuggestionMarkers'
import type { Spot, SpotSuggestion } from '@/features/spots/types'
import { colors } from '@/shared/theme'

export default function MapScreen() {
  const router = useRouter()
  // Pedidos vindos de fora: foco em spot ("Ver no mapa" pós-publicação) e
  // abertura do fluxo de rolê (CreateFab das outras abas).
  const {
    focusSpotId,
    focusLat,
    focusLng,
    suggest: suggestParam,
  } = useLocalSearchParams<{
    focusSpotId?: string
    focusLat?: string
    focusLng?: string
    suggest?: string
  }>()
  const {
    coords: userCoords,
    status: locationStatus,
    grant: grantLocation,
  } = useLocationGate()
  const locationInvite = useLocationInvite(locationStatus)
  const livePos = useUserLiveLocation(locationStatus === 'ready')
  const myPos = livePos ?? userCoords
  const profile = useMyProfile()
  const { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent, fitToCoords } =
    useMapCamera()
  const { zoomBucket, onCameraZoomChange } = useMapZoomState()
  const { bbox, onRegionChange } = useViewportBbox(mapRef)

  const filters = useMapUiStore(s => s.filters)
  const setFilters = useMapUiStore(s => s.setFilters)
  const showBanner = useBanner()
  const lightPreset = useMapLightPreset()
  const headerClearance = useHeaderClearance()

  const [selectedEvent, setSelectedEvent] = useState<FeedEvent | null>(null)
  const [avatarIconUri, setAvatarIconUri] = useState<string | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [densityVisible, setDensityVisible] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  // O fluxo de gerar vive aqui (não no painel) pra fechar/reabrir o painel
  // sem perder as sugestões já geradas — reabrir não gasta outra geração.
  const suggest = useSuggestSpots()

  // Filtro de tipo (chips Eventos/Rolês): desliga a query do tipo oculto e
  // esvazia o dado na renderização — só desabilitar não basta, o cache do
  // keepPreviousData continuaria alimentando as camadas.
  const showEvents = filters.kind !== 'spots'
  const showSpots = filters.kind !== 'events'

  const mapEvents = useMapEvents(bbox, filters, showEvents)
  const { truncated, isLoading, error } = mapEvents
  const events = useMemo(
    () => (showEvents ? mapEvents.events : []),
    [showEvents, mapEvents.events],
  )
  // Clusterização em JS: agrupados viram badges nativos; os que sobram são
  // MarkerViews completos (emoji + confirmados) em qualquer zoom.
  const { clusters, singles } = useEventClusters(events, zoomBucket)
  // Spots sempre visíveis, sem o gate de zoom dos pins de evento: o zoom
  // padrão (USER_ZOOM) fica abaixo do threshold e esconderia os balões. O
  // volume é baixo (máx. 5 ativos por usuário, vida de 24h) — não clusteriza.
  const { data: viewportSpots = [] } = useViewportSpots(
    bbox,
    filters,
    showSpots,
  )
  const spots = useMemo(
    () => (showSpots ? viewportSpots : []),
    [showSpots, viewportSpots],
  )
  const { data: heatmapPoints = [] } = useHeatmap(
    bbox,
    filters,
    densityVisible && showEvents,
  )

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
    if (focusSpotId) {
      setSpotToOpen(focusSpotId)
      // O rolê focado precisa estar visível — destrava o filtro de tipo.
      if (filters.kind === 'events') setFilters({ ...filters, kind: 'all' })
    }
    router.setParams({ focusSpotId: '', focusLat: '', focusLng: '' })
  }, [
    focusSpotId,
    focusLat,
    focusLng,
    focusOnEvent,
    router,
    filters,
    setFilters,
  ])

  // Recentro automático só sem foco pedido — o fix de GPS chega depois do
  // voo e roubaria a câmera (o ref cobre a janela após limpar os params).
  useEffect(() => {
    if (!userCoords || focusLat || focusConsumedRef.current) return
    flyTo(userCoords, USER_ZOOM, 800)
  }, [userCoords, flyTo, focusLat])

  // "Rolê" pedido por outra aba: abre o painel de sugestões e apaga o param
  // (grudado na tab, reabriria o painel a cada volta pro mapa).
  useEffect(() => {
    if (!suggestParam) return
    setSuggestionsOpen(true)
    // Publicar rolê com o filtro em "Eventos" esconderia o resultado.
    if (filters.kind === 'events') setFilters({ ...filters, kind: 'all' })
    router.setParams({ suggest: '' })
  }, [suggestParam, router, filters, setFilters])

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

  /**
   * Caminho ÚNICO pra pedir acesso à localização — card, banner e o botão de
   * centralizar entram todos por aqui. Antes cada um tinha seu próprio pedido,
   * e o fluxo ficava impossível de prever.
   */
  async function requestLocationAccess() {
    // Sem banner nos casos que LEVAM a algum lugar: os ajustes abrindo e a tela
    // de privacidade (que mostra o estado revogado no topo) já são a resposta.
    // Texto ali seria o terceiro aviso sobre a mesma coisa.
    if (locationStatus === 'denied') {
      Linking.openSettings()
      return
    }
    if (locationStatus === 'revoked') {
      // Revogação se desfaz no app, não nos ajustes do sistema — mandar pra lá
      // faria a pessoa ativar a permissão e continuar sem ver nada.
      router.push('/profile/privacy')
      return
    }
    const result = await grantLocation()
    if (result === 'denied') {
      Linking.openSettings()
    } else if (result === 'error') {
      // Único caso sem destino: aqui o texto é o feedback que existe.
      showBanner('Não foi possível obter sua localização.')
    }
  }

  // Centraliza na posição ATUAL (live), com fallback pro fix inicial. Sem
  // coords, o toque vira o pedido de acesso.
  async function recenter() {
    if (myPos) {
      flyTo(myPos, USER_ZOOM, 600)
      return
    }
    await requestLocationAccess()
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
        {densityVisible && showEvents && (
          <EventHeatmapLayer points={heatmapPoints} />
        )}
        {/* Indicador de posição como STYLE LAYER (não MarkerView): style layer
            NUNCA captura toque e fica abaixo dos pins — então nunca bloqueia a
            interação com eles (o MarkerView bloqueava, mesmo com pointerEvents). */}
        {locationStatus === 'ready' && myPos && (
          <UserLocationLayer coordinate={myPos} avatarIconUri={avatarIconUri} />
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
        {/* Balão completo (foto do criador + membros) em QUALQUER zoom — o
            mini de zoom baixo foi aposentado. Como MarkerView, os balões
            ficam acima dos badges de cluster; o volume é baixo (máx. 5
            ativos por usuário). */}
        <SpotMarkers
          spots={spots}
          selectedId={selectedSpot?.id}
          onPress={openSpot}
          dimmed={densityVisible}
        />
        {suggestionsOpen && (
          <SuggestionMarkers
            suggestions={suggest.suggestions}
            onPress={chooseSuggestion}
          />
        )}
      </Mapbox.MapView>

      {/* Escondida com o painel de rolê aberto: a folha cresce até encostar
          no header, e o GlassSurface (BlurView nativo) da busca vaza por
          cima dela no iOS — UIVisualEffectView compõe numa camada própria
          que ignora a ordem de pintura normal da árvore RN. */}
      {!suggestionsOpen && (
        <View
          className="absolute left-0 right-0 gap-2"
          style={{ top: headerClearance }}
          pointerEvents="box-none"
        >
          <View className="px-3">
            <MapSearchBar onSelect={openEvent} />
          </View>
          <MapCategoryChips />
        </View>
      )}

      {isLoading && !error && (
        <View
          className="absolute self-center bg-surface/90 px-3 py-1.5 rounded-lg border border-line-strong"
          style={{ top: headerClearance + 84 }}
        >
          <ActivityIndicator size="small" color={colors.brandEmphasis} />
        </View>
      )}

      {/* Um aviso por vez nessa faixa: o de truncamento reage ao zoom que a
          pessoa acabou de dar, enquanto este fica enquanto faltar permissão. */}
      {locationStatus !== 'ready' &&
        locationStatus !== 'loading' &&
        !locationInvite.visible &&
        !isLoading &&
        !truncated &&
        !error && (
          <MapStatusBanner
            icon={GpsSlashIcon}
            top={headerClearance + 92}
            message="Sua posição é exibida somente para você. Habilite sua localização no mapa e descubra rolês e eventos perto de você."
            onPress={() => void requestLocationAccess()}
          />
        )}

      {!isLoading && truncated && !error && showEvents && (
        <View
          className="absolute self-center bg-surface/90 px-3 py-1.5 rounded-lg border border-line-strong"
          style={{ top: headerClearance + 84 }}
        >
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
          <CreateFab
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

      {locationInvite.visible && !selectedEvent && !selectedSpot && (
        <LocationInviteCard
          onEnable={() => {
            locationInvite.hide()
            void requestLocationAccess()
          }}
          onDismiss={locationInvite.hide}
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
