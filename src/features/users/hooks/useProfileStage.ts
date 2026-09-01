import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { runOnJS } from 'react-native-worklets'
import {
  focusForTouch,
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
 * contextual à seção tocada. `expand` (0..1) é o único estado animado: 0 é o
 * resumo, 1 é a seção em foco no lugar. Foco em eventos: a folha sobe a
 * altura do mural e encaixa sob o header, que fica fixo; encaixada, a lista
 * rola e leva o header junto (collapsing header) — a página inteira rola.
 * Foco no mural: só a seção de eventos desce e sai; header e mural ficam, a
 * grade rola e leva o header; ao voltar ao topo, eventos retorna sozinha.
 *
 * Nada de layout muda por frame — só transform — e as listas nunca trocam de
 * `scrollEnabled`: enquanto o palco é dono do toque, o offset delas é preso
 * em zero no próprio evento de scroll (worklet, síncrono na thread de UI).
 * É o que deixa a lista assumir o MESMO toque no instante do encaixe, sem
 * levantar o dedo — trocar scrollEnabled no meio do toque não pega no iOS.
 */
export function useProfileStage({ muralLocked, muralHeight }: Params) {
  const expand = useSharedValue(0)
  const focus = useSharedValue<StageFocus>('mural')
  const startExpand = useSharedValue(0)
  const startTranslation = useSharedValue(0)
  const lastTranslation = useSharedValue(0)
  const panOwns = useSharedValue(false)
  const muralOffset = useSharedValue(0)
  const eventsOffset = useSharedValue(0)
  const headerHeight = useSharedValue(0)
  const stageHeight = useSharedValue(0)
  const muralSummary = useSharedValue(muralHeight)
  const muralIsLocked = useSharedValue(muralLocked)
  const reported = useSharedValue<StageFocus | null>(null)
  // Seção encaixada e parada. Não decide mais o scroll (isso é a trava, na
  // thread de UI) — só a pista "Ver todos" e o carregar-mais das listas.
  const [expanded, setExpanded] = useState<StageFocus | null>(null)
  // Cópia JS da altura do header: as listas recuam esse tanto no topo (prop
  // de layout, muda só quando o header muda).
  const [headerInset, setHeaderInset] = useState(0)
  // Refs animadas: a trava do offset (scrollTo no worklet) e o collapse
  // imperativo (re-tap na aba) precisam alcançar as listas.
  const muralList = useAnimatedRef<FlatList>()
  const eventsList = useAnimatedRef<FlatList>()

  useEffect(() => {
    muralSummary.value = muralHeight
  }, [muralHeight, muralSummary])
  useEffect(() => {
    muralIsLocked.value = muralLocked
  }, [muralLocked, muralIsLocked])

  // Só nos pontos de repouso (0 e 1): trocar estado JS no meio do gesto
  // re-renderiza as duas grades e o dedo sente o engasgo.
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

  // A lista só é dona do scroll com a própria seção encaixada. Fora disso o
  // offset volta a zero no mesmo evento que o mudou — o frame nunca chega a
  // mostrar o deslocamento.
  const listOwnsScroll = (section: StageFocus) => {
    'worklet'
    return focus.value === section && expand.value >= 1 - EPSILON
  }

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
        })
        .onStart(e => {
          // Tocar no meio do encaixe: o spring pararia de brigar com o dedo
          // só no fim — cancela e o gesto assume de onde a seção está.
          cancelAnimation(expand)
          const offset =
            focus.value === 'mural' ? muralOffset.value : eventsOffset.value
          // Encaixada, a lista é dona do gesto — exceto arrastar pra baixo com
          // ela no topo, que é o pedido de voltar ao resumo.
          panOwns.value =
            expand.value < 1 || (e.translationY > 0 && offset <= 0)
          startExpand.value = expand.value
          startTranslation.value = e.translationY
          lastTranslation.value = e.translationY
        })
        .onUpdate(e => {
          if (!panOwns.value) {
            // Eventos encaixada e rolando: a lista chegou ao topo e o dedo
            // segue descendo — o palco assume no mesmo toque e desencaixa.
            // (No mural a volta é a mola da chegada, em onMuralScroll.)
            const takesOver =
              focus.value === 'events' &&
              expand.value >= 1 - EPSILON &&
              eventsOffset.value <= 0 &&
              e.translationY > lastTranslation.value
            lastTranslation.value = e.translationY
            if (!takesOver) return
            panOwns.value = true
            startExpand.value = expand.value
            startTranslation.value = e.translationY
          }
          lastTranslation.value = e.translationY
          expand.value = nextExpand(
            startExpand.value,
            e.translationY - startTranslation.value,
            travelDistance(
              focus.value,
              headerHeight.value,
              muralSummary.value,
              stageHeight.value,
            ),
          )
        })
        .onEnd(e => {
          if (!panOwns.value) return
          expand.value = withSpring(
            snapTarget(expand.value, startExpand.value, e.velocityY),
            SPRING,
          )
        }),
    [
      muralNative,
      eventsNative,
      expand,
      focus,
      headerHeight,
      muralSummary,
      muralIsLocked,
      stageHeight,
      muralOffset,
      eventsOffset,
      panOwns,
      startExpand,
      startTranslation,
      lastTranslation,
    ],
  )

  const onMuralScroll = useAnimatedScrollHandler({
    onScroll: e => {
      const offset = e.contentOffset.y
      if (!listOwnsScroll('mural')) {
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
  const onEventsScroll = useAnimatedScrollHandler({
    onScroll: e => {
      const offset = e.contentOffset.y
      if (!listOwnsScroll('events')) {
        if (offset > 0) scrollTo(eventsList, 0, 0, false)
        eventsOffset.value = 0
        return
      }
      eventsOffset.value = offset
    },
  })

  // Quanto do header já saiu por cima: o scroll da lista em foco (collapsing
  // header). Fora do encaixe o offset é zero pela trava, e o header não sai.
  const muralCollapse = () => {
    'worklet'
    return Math.min(headerHeight.value, Math.max(0, muralOffset.value))
  }
  const eventsCollapse = () => {
    'worklet'
    return Math.min(headerHeight.value, Math.max(0, eventsOffset.value))
  }

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: -(focus.value === 'events'
          ? eventsCollapse()
          : muralCollapse()),
      },
    ],
  }))

  // A folha de eventos (recorte + fundo) nasce logo abaixo do resumo do mural
  // com a altura do palco — geometria estática, no ProfileStage. Foco no
  // mural: desce e sai por baixo. Foco em eventos: sobe a altura do mural e
  // encaixa sob o header; encaixada, acompanha o header pra cima conforme a
  // lista rola — é ela que fecha o vão sob ele.
  const eventsStyle = useAnimatedStyle(() => {
    const top = headerHeight.value + muralSummary.value
    const translateY =
      focus.value === 'mural'
        ? (stageHeight.value - top) * expand.value
        : -(muralSummary.value * expand.value + eventsCollapse())
    return { transform: [{ translateY }] }
  })

  // A lista de eventos vive a altura do header ACIMA da folha (recuo no topo
  // do conteúdo, recortado por ela) e, encaixada, desfaz o movimento da
  // folha: fica parada na tela enquanto folha e header sobem, e o conteúdo
  // rola 1:1 com o dedo. É o "a página inteira rola" sem trocar de geometria.
  const eventsListStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: eventsCollapse() }],
  }))

  const veilStyle = useAnimatedStyle(() => ({
    opacity: 1 - expand.value,
  }))

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

  // "Ver todas/todos": o mesmo encaixe do gesto.
  const expandTo = useCallback(
    (target: StageFocus) => {
      focus.value = target
      expand.value = withSpring(1, SPRING)
    },
    [focus, expand],
  )
  // Re-tap na aba: tudo volta ao resumo. As listas precisam voltar ao topo
  // antes, senão o resumo mostra fileiras roladas e o header preso escondido.
  const collapse = useCallback(() => {
    muralList.current?.scrollToOffset({ offset: 0, animated: false })
    eventsList.current?.scrollToOffset({ offset: 0, animated: false })
    muralOffset.value = 0
    eventsOffset.value = 0
    expand.value = withSpring(0, SPRING)
  }, [muralList, eventsList, expand, muralOffset, eventsOffset])

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
    expanded,
    headerInset,
    setHeaderHeight,
    setStageHeight,
    expandTo,
    collapse,
  }
}
