import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FlatList } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  cancelAnimation,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { runOnJS, runOnUI } from 'react-native-worklets'
import {
  focusForTouch,
  headerCollapse,
  nextExpand,
  snapTarget,
  travelDistance,
  type StageFocus,
} from '../utils/profileStage'

// Sem overshoot: a seção encaixa no topo; passar dele abriria uma fresta.
const SPRING = { damping: 26, stiffness: 240, overshootClamping: true }
const EPSILON = 0.001

type Params = {
  // Sem o que expandir (vazio ou até 2 fileiras): o toque no mural vira eventos.
  muralLocked: boolean
  // Altura do mural em modo resumo — calculada (utils/profileStage), não medida.
  muralHeight: number
}

/**
 * Palco do perfil: header + mural + eventos no mesmo lugar, e um gesto que é
 * contextual à seção tocada.
 *
 * EVENTOS é 100% dirigido pelo scroll nativo da própria lista: puxar a folha
 * JÁ É rolar (o conteúdo recua header + mural, e esse recuo rolando pra fora é
 * a folha subindo). Folha, header e pista seguem o offset por transform, e
 * `snapToOffsets` [0, mural] faz o encaixe/desencaixe com física nativa — sem
 * pan, sem trava, sem estado: era a briga trava×rastreio (2 eventos + 2
 * commits de estado por frame, e commits JS pausam os do Reanimated) que
 * fazia a folha engasgar. `expand` = min(1, offset/mural) vira derivado.
 *
 * MURAL é dirigido pelo pan: a folha de eventos desce e sai (expand 0→1);
 * header e mural ficam, a grade rola e leva o header. Enquanto o pan é dono,
 * o offset da grade fica preso em zero no próprio evento de scroll (worklet,
 * síncrono na thread de UI) — é o que deixa a grade assumir o MESMO toque no
 * instante em que expande (trocar scrollEnabled no meio do toque não pega).
 *
 * Nada de layout muda por frame e nenhum setState liga ao gesto.
 */
export function useProfileStage({ muralLocked, muralHeight }: Params) {
  const expand = useSharedValue(0)
  const focus = useSharedValue<StageFocus>('mural')
  const startExpand = useSharedValue(0)
  const startTranslation = useSharedValue(0)
  const panOwns = useSharedValue(false)
  // Mural travado: o toque FORA da folha também abre eventos — aí é o pan que
  // dirige o offset (scrollTo por frame), já que a folha não foi tocada.
  const panDrivesEvents = useSharedValue(false)
  const muralOffset = useSharedValue(0)
  const eventsOffset = useSharedValue(0)
  const headerHeight = useSharedValue(0)
  const stageHeight = useSharedValue(0)
  const muralSummary = useSharedValue(muralHeight)
  const muralIsLocked = useSharedValue(muralLocked)
  const reported = useSharedValue<StageFocus | null>(null)
  // Seção encaixada e parada, FORA do render: um setState aqui re-renderizava
  // as duas seções no rabo da animação — o micro-engasgo de fim de drawer.
  // Quem precisa saber (carregar-mais) lê pela função; a pista "Ver todos"
  // some por opacidade animada, não por render.
  const expandedRef = useRef<StageFocus | null>(null)
  const setExpanded = useCallback((value: StageFocus | null) => {
    expandedRef.current = value
  }, [])
  // Cópia JS da altura do header: as listas recuam esse tanto no topo (prop
  // de layout, muda só quando o header muda).
  const [headerInset, setHeaderInset] = useState(0)
  // Refs animadas: a trava do mural e o pan de eventos (mural travado) fazem
  // scrollTo de dentro de worklet; o collapse imperativo também.
  const muralList = useAnimatedRef<FlatList>()
  const eventsList = useAnimatedRef<FlatList>()

  useEffect(() => {
    muralSummary.value = muralHeight
  }, [muralHeight, muralSummary])
  useEffect(() => {
    muralIsLocked.value = muralLocked
  }, [muralLocked, muralIsLocked])

  // Só nos pontos de repouso (0 e 1), e só a ref — nenhum render.
  useAnimatedReaction(
    () => expand.value,
    value => {
      const settledAtTop = value >= 1 - EPSILON
      const settledAtRest = value <= EPSILON
      if (!settledAtTop && !settledAtRest) return
      const next: StageFocus | null = settledAtTop ? focus.value : null
      if (next === reported.value) return
      reported.value = next
      runOnJS(setExpanded)(next)
    },
  )

  const muralNative = useMemo(() => Gesture.Native(), [])
  const eventsNative = useMemo(() => Gesture.Native(), [])

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-6, 6])
        .failOffsetX([-24, 24])
        .simultaneousWithExternalGesture(muralNative, eventsNative)
        .onBegin(e => {
          // A seção só é escolhida no resumo; no meio do caminho o foco fica.
          if (expand.value === 0) {
            focus.value = focusForTouch(
              e.y,
              headerHeight.value,
              muralSummary.value,
              muralIsLocked.value,
            )
          }
          // Toque acima do topo atual da folha: ela não foi tocada, então o
          // scroll nativo não rastreia — o pan assume o offset por ela.
          panDrivesEvents.value =
            focus.value === 'events' &&
            e.y < headerHeight.value + muralSummary.value * (1 - expand.value)
        })
        .onStart(e => {
          // Tocar no meio de uma animação do mural: cancela a mola e o gesto
          // assume de onde a seção está. (Eventos anima pelo scroll nativo —
          // tocar a folha já interrompe sozinho.)
          cancelAnimation(expand)
          if (focus.value === 'events') {
            panOwns.value = panDrivesEvents.value
          } else {
            // Expandida, a grade é dona do gesto — exceto arrastar pra baixo
            // com ela no topo, que é o pedido de voltar ao resumo.
            panOwns.value =
              expand.value < 1 || (e.translationY > 0 && muralOffset.value <= 0)
          }
          startExpand.value = expand.value
          startTranslation.value = e.translationY
        })
        .onUpdate(e => {
          if (!panOwns.value) return
          const next = nextExpand(
            startExpand.value,
            e.translationY - startTranslation.value,
            travelDistance(
              focus.value,
              headerHeight.value,
              muralSummary.value,
              stageHeight.value,
            ),
          )
          if (focus.value === 'events') {
            // O offset é a única fonte da posição da folha: o pan escreve
            // nele e tudo (folha, expand, header) segue pelo onScroll.
            scrollTo(eventsList, 0, next * muralSummary.value, false)
            return
          }
          expand.value = next
        })
        .onEnd(e => {
          if (!panOwns.value) return
          const target = snapTarget(
            expand.value,
            startExpand.value,
            e.velocityY,
          )
          if (focus.value === 'events') {
            scrollTo(eventsList, 0, target * muralSummary.value, true)
            return
          }
          expand.value = withSpring(target, SPRING)
        }),
    [
      muralNative,
      eventsNative,
      eventsList,
      expand,
      focus,
      headerHeight,
      muralSummary,
      muralIsLocked,
      stageHeight,
      muralOffset,
      panOwns,
      panDrivesEvents,
      startExpand,
      startTranslation,
    ],
  )

  const onMuralScroll = useAnimatedScrollHandler({
    onScroll: e => {
      const offset = e.contentOffset.y
      // Fora do próprio expandido, a grade não é dona do scroll: o offset
      // volta a zero no mesmo evento que o mudou — o frame nunca chega a
      // mostrar o deslocamento, e o mesmo toque assume quando expande.
      if (!(focus.value === 'mural' && expand.value >= 1 - EPSILON)) {
        if (offset > 0) scrollTo(muralList, 0, 0, false)
        muralOffset.value = 0
        return
      }
      const previous = muralOffset.value
      muralOffset.value = offset
      // CHEGOU de volta ao topo rolando (vinha de baixo): a seção de eventos
      // volta sozinha, sem pedir um segundo gesto. Só na chegada — um arrasto
      // que começa no topo também emite y = 0 e não pode disparar isto.
      if (previous > 0 && offset <= 0) {
        expand.value = withSpring(0, SPRING)
      }
    },
  })
  // Eventos: o offset manda. Os primeiros `mural` px de rolagem são a folha
  // subindo (expand derivado); dali em diante é header colapsando e conteúdo.
  const onEventsScroll = useAnimatedScrollHandler({
    onScroll: e => {
      eventsOffset.value = e.contentOffset.y
      if (focus.value === 'events') {
        expand.value = Math.min(1, e.contentOffset.y / muralSummary.value)
      }
    },
  })

  // Os estilos leem os offsets DIRETO no updater: o useAnimatedStyle só
  // assina os shared values presentes na closure dele (não entra em funções
  // auxiliares), e uma leitura escondida numa função deixa o estilo surdo ao
  // scroll. No foco em eventos o header só sai depois do encaixe (offset
  // além da altura do mural).
  const headerStyle = useAnimatedStyle(() => {
    const offset =
      focus.value === 'events'
        ? eventsOffset.value - muralSummary.value
        : muralOffset.value
    return {
      transform: [{ translateY: -headerCollapse(headerHeight.value, offset) }],
    }
  })

  // A folha de eventos (recorte + fundo) nasce logo abaixo do resumo do mural
  // com a altura do palco — geometria estática, no ProfileStage. Foco no
  // mural: desce e sai por baixo. Foco em eventos: sobe com o scroll até
  // encaixar (mural px) e segue com o header até ele sair (+ header px).
  const eventsStyle = useAnimatedStyle(() => {
    const top = headerHeight.value + muralSummary.value
    const translateY =
      focus.value === 'mural'
        ? (stageHeight.value - top) * expand.value
        : -Math.min(eventsOffset.value, muralSummary.value + headerHeight.value)
    return { transform: [{ translateY }] }
  })

  // A lista vive a altura do header ACIMA da folha (recuo no topo do
  // conteúdo, recortado por ela) e desfaz o movimento da folha: a soma dos
  // dois transforms é zero e o conteúdo anda SÓ pelo scroll nativo — é o "a
  // página inteira rola" com o dedo 1:1, liso por construção.
  const eventsListStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: Math.min(
          eventsOffset.value,
          muralSummary.value + headerHeight.value,
        ),
      },
    ],
  }))

  // Fade do resumo: o véu "+N" do mural e a pista "Ver todos ↑" de eventos
  // somem conforme a seção toma o palco — na thread de UI, sem render.
  const veilStyle = useAnimatedStyle(() => ({
    opacity: 1 - expand.value,
  }))

  const canLoadMore = useCallback(
    (section: StageFocus) => expandedRef.current === section,
    [],
  )

  const setHeaderHeight = useCallback(
    (height: number) => {
      headerHeight.value = height
      setHeaderInset(height)
    },
    [headerHeight],
  )
  const setStageHeight = useCallback(
    (height: number) => {
      stageHeight.value = height
    },
    [stageHeight],
  )

  // "Ver todas/todos": o mesmo caminho do gesto — mola no mural, scroll
  // nativo animado em eventos.
  const expandTo = useCallback(
    (target: StageFocus) => {
      if (target === 'events') {
        runOnUI(() => {
          focus.value = 'events'
          scrollTo(eventsList, 0, muralSummary.value, true)
        })()
        return
      }
      focus.value = 'mural'
      expand.value = withSpring(1, SPRING)
    },
    [focus, expand, eventsList, muralSummary],
  )
  // Re-tap na aba: tudo volta ao resumo. A grade volta ao topo antes da mola
  // (senão o resumo mostra fileiras roladas); eventos volta ROLANDO (é o
  // scroll que o posiciona).
  const collapse = useCallback(() => {
    muralList.current?.scrollToOffset({ offset: 0, animated: false })
    muralOffset.value = 0
    runOnUI(() => {
      if (focus.value === 'events' && eventsOffset.value > 0) {
        scrollTo(eventsList, 0, 0, true)
        return
      }
      scrollTo(eventsList, 0, 0, false)
      expand.value = withSpring(0, SPRING)
    })()
  }, [muralList, eventsList, expand, focus, eventsOffset, muralOffset])

  return {
    pan,
    muralNative,
    eventsNative,
    muralList,
    eventsList,
    onMuralScroll,
    onEventsScroll,
    headerStyle,
    eventsStyle,
    eventsListStyle,
    veilStyle,
    canLoadMore,
    headerInset,
    setHeaderHeight,
    setStageHeight,
    expandTo,
    collapse,
  }
}
