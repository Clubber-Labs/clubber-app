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
import { colors } from '@/shared/theme'

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
  const muralHeight = muralSummaryHeight(width, summaryCount)
  const stage = useProfileStage({ muralLocked: !expandable, muralHeight })
  // A folha de eventos nasce logo abaixo do resumo do mural, com a altura do
  // palco (o que passa dele é recortado). Geometria estática: muda só com o
  // header medido ou o número de fotos, nunca por frame — o gesto é só
  // transform, e é isso que o mantém liso.
  const sheetTop = stage.headerInset + muralHeight

  // Re-tap na aba Perfil: volta ao resumo. No perfil de terceiros (stack) o
  // evento tabPress nunca é emitido — o hook fica inerte.
  useActiveTabPress(stage.collapse)
  // Identidade estável: a seção é memoizada e um closure novo a re-renderizaria
  // a cada encaixe do palco.
  const { expandTo } = stage
  const openMural = useCallback(() => expandTo('mural'), [expandTo])
  const openEvents = useCallback(() => expandTo('events'), [expandTo])

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
          {/* Ordem = camadas: mural embaixo, eventos no meio, header por cima.
              Nenhuma seção sobe além do pé do header, e as duas rolam por
              baixo dele (collapsing header). Seções só depois do header
              medido: antes disso o recuo seria 0 e a grade piscaria. */}
          {stage.headerInset > 0 && (
            <View style={[styles.section, styles.fill]}>
              <ProfileMuralSection
                photos={photos}
                isOwnProfile={isOwnProfile}
                tileSize={tileSize}
                topInset={stage.headerInset}
                expanded={stage.expanded === 'mural'}
                native={stage.muralNative}
                listRef={stage.muralList}
                onScroll={stage.onMuralScroll}
                veilStyle={stage.veilStyle}
                expandable={expandable}
                onPressPhoto={onPressPhoto}
                onAddPhoto={onAddPhoto}
                onViewAll={openMural}
                bottomPadding={bottomPadding}
              />
            </View>
          )}
          {stage.headerInset > 0 && (
            <Animated.View
              style={[
                styles.section,
                styles.eventsSheet,
                { top: sheetTop, bottom: -sheetTop },
                stage.eventsStyle,
              ]}
            >
              <ProfileEventsSection
                events={events}
                ownerId={ownerId}
                isOwnProfile={isOwnProfile}
                topInset={stage.headerInset}
                expanded={stage.expanded === 'events'}
                listStyle={stage.eventsListStyle}
                native={stage.eventsNative}
                listRef={stage.eventsList}
                onScroll={stage.onEventsScroll}
                onCreate={onCreateEvent}
                onViewAll={openEvents}
                bottomPadding={bottomPadding}
              />
            </Animated.View>
          )}
          <Animated.View
            style={[styles.header, stage.headerStyle]}
            onLayout={e => stage.setHeaderHeight(e.nativeEvent.layout.height)}
          >
            {header}
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  )
}

const EVENTS_SHEET_RADIUS = 24

const styles = StyleSheet.create({
  stage: { flex: 1, overflow: 'hidden' },
  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  section: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  // O mural ocupa o palco inteiro, por baixo do header (a lista recua a
  // altura dele). O que o "recorta" no resumo é a folha de eventos por cima;
  // quando ela desce, o resto da grade aparece por trás. Não se move.
  fill: { top: 0, bottom: 0 },
  // Eventos é a folha que cobre o mural: fundo opaco e topo arredondado (raio
  // de sheet) com o mesmo hairline do SheetModal. Ao subir, encaixa sob o
  // header de vidro com essa borda. A lista mora dentro dela e passa do seu
  // topo — o que passa é recortado E fica fora do alcance do toque.
  eventsSheet: {
    // As laterais saem meio pixel da tela: o hairline precisa existir nos
    // quatro lados pra contornar o raio, mas visível só no topo.
    left: -StyleSheet.hairlineWidth,
    right: -StyleSheet.hairlineWidth,
    backgroundColor: colors.background,
    borderTopLeftRadius: EVENTS_SHEET_RADIUS,
    borderTopRightRadius: EVENTS_SHEET_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
})
