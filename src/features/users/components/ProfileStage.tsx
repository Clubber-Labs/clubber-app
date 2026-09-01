import { useCallback, type ReactNode } from 'react'
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { ProfileMuralSection } from './ProfileMuralSection'
import { ProfileEventsSection } from './ProfileEventsSection'
import { ProfileEventsEmpty } from './ProfileEventsEmpty'
import { useProfileStage } from '../hooks/useProfileStage'
import {
  MURAL_SUMMARY_COUNT,
  muralExpandable,
  muralSummaryHeight,
  muralTileSize,
} from '../utils/profileStage'
import { useActiveTabPress } from '@/shared/hooks/useActiveTabPress'
import type { UserEventSummary, UserPhoto } from '@/shared/types'

export type StageList<T> = {
  items: T[]
  totalCount: number
  isLoading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

type Props = {
  header: ReactNode
  ownerId: string
  isOwnProfile: boolean
  // Perfil privado sem acesso: header + aviso, sem seções nem gesto.
  locked?: boolean
  photos: StageList<UserPhoto>
  events: StageList<UserEventSummary>
  onPressPhoto: (photo: UserPhoto) => void
  // Dono do perfil: o "+" discreto na vaga livre da fileira.
  onAddPhoto?: () => void
  onCreateEvent?: () => void
  // Aba com pílula/header flutuantes passa os clearances; perfil de terceiros
  // (stack, header no fluxo) usa os defaults.
  topPadding?: number
  bottomPadding?: number
}

/**
 * Compõe header, mural e eventos no palco animado (useProfileStage). As três
 * peças são absolutas e o palco recorta o que passa da tela: no resumo a
 * vitrine de eventos só espia por baixo do mural.
 */
export function ProfileStage({
  header,
  ownerId,
  isOwnProfile,
  locked = false,
  photos,
  events,
  onPressPhoto,
  onAddPhoto,
  onCreateEvent,
  topPadding = 0,
  bottomPadding = 32,
}: Props) {
  const { width } = useWindowDimensions()
  const tileSize = muralTileSize(width)
  const expandable = muralExpandable(photos.totalCount, photos.hasNextPage)
  // Carregando, o fantasma tem duas fileiras — o resumo reserva o mesmo.
  const summaryCount = photos.isLoading
    ? MURAL_SUMMARY_COUNT
    : photos.items.length
  const stage = useProfileStage({
    muralLocked: !expandable,
    muralHeight: muralSummaryHeight(width, summaryCount),
  })

  // Re-tap na aba Perfil: volta ao resumo. No perfil de terceiros (stack) o
  // evento tabPress nunca é emitido — o hook fica inerte.
  useActiveTabPress(stage.collapse)
  // Identidade estável: a seção é memoizada e um closure novo a re-renderizaria
  // a cada encaixe do palco.
  const { expandTo } = stage
  const openMural = useCallback(() => expandTo('mural'), [expandTo])

  if (locked) {
    return (
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        }}
      >
        {header}
        <ProfileEventsEmpty variant="private" />
      </ScrollView>
    )
  }

  return (
    <View style={{ flex: 1, paddingTop: topPadding }}>
      <GestureDetector gesture={stage.pan}>
        <View
          style={styles.stage}
          onLayout={e => stage.setStageHeight(e.nativeEvent.layout.height)}
        >
          <Animated.View
            style={[styles.header, stage.headerStyle]}
            onLayout={e => stage.setHeaderHeight(e.nativeEvent.layout.height)}
          >
            {header}
          </Animated.View>
          {/* Seções só depois do header medido: antes disso o topo delas
              seria 0 e elas piscariam por cima do header. */}
          {stage.headerMeasured && (
            <>
              <Animated.View
                style={[styles.section, styles.muralSheet, stage.muralStyle]}
              >
                <ProfileMuralSection
                  photos={photos}
                  isOwnProfile={isOwnProfile}
                  tileSize={tileSize}
                  scrollEnabled={stage.expanded === 'mural'}
                  native={stage.muralNative}
                  onScroll={stage.onMuralScroll}
                  veilStyle={stage.veilStyle}
                  expandable={expandable}
                  onPressPhoto={onPressPhoto}
                  onAddPhoto={onAddPhoto}
                  onViewAll={openMural}
                  bottomPadding={bottomPadding}
                />
              </Animated.View>
              <Animated.View style={[styles.section, stage.eventsStyle]}>
                <ProfileEventsSection
                  events={events}
                  ownerId={ownerId}
                  isOwnProfile={isOwnProfile}
                  scrollEnabled={stage.expanded === 'events'}
                  native={stage.eventsNative}
                  onScroll={stage.onEventsScroll}
                  onCreate={onCreateEvent}
                  bottomPadding={bottomPadding}
                />
              </Animated.View>
            </>
          )}
        </View>
      </GestureDetector>
    </View>
  )
}

const MURAL_SHEET_RADIUS = 24

const styles = StyleSheet.create({
  stage: { flex: 1, overflow: 'hidden' },
  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  section: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  // O mural começa como uma folha: topo arredondado (raio de sheet) com o
  // mesmo hairline do SheetModal. O overflow hidden da seção faz a primeira
  // fileira de fotos acompanhar o arredondado.
  muralSheet: {
    borderTopLeftRadius: MURAL_SHEET_RADIUS,
    borderTopRightRadius: MURAL_SHEET_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
})
