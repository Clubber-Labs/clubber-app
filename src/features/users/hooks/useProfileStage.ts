import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FlatList } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  cancelAnimation,
  useAnimatedReaction,
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
  stageMax,
  stageTravel,
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
 * contextual à seção tocada. `expand` é o único estado animado e conta
 * ESTÁGIOS: 0 é o resumo. Foco no mural (máx. 1): a seção de eventos desce e
 * sai; header e mural ficam, a grade rola normal e leva o header junto. Foco
 * em eventos (máx. 2): a folha sobe a altura do mural e encaixa sob o header
 * fixo (1); puxar de novo leva header e folha juntos até o header sair (2);
 * só então a lista rola. Tudo por transform — nenhuma propriedade de layout
 * muda por frame, e é isso que mantém o gesto liso.
 */
export function useProfileStage({ muralLocked, muralHeight }: Params) {
  const expand = useSharedValue(0)
  const focus = useSharedValue<StageFocus>('mural')
  const startExpand = useSharedValue(0)
  const startTranslation = useSharedValue(0)
  const panOwns = useSharedValue(false)
  const muralOffset = useSharedValue(0)
  const eventsOffset = useSharedValue(0)
  const headerHeight = useSharedValue(0)
  const stageHeight = useSharedValue(0)
  const muralSummary = useSharedValue(muralHeight)
  const muralIsLocked = useSharedValue(muralLocked)
  const reported = useSharedValue<StageFocus | null>(null)
  // Seção no último estágio e parada — é ela que ganha scroll próprio.
  const [expanded, setExpanded] = useState<StageFocus | null>(null)
  // Cópia JS da altura do header: a lista do mural recua esse tanto no topo
  // (é um prop de layout, muda só quando o header muda).
  const [headerInset, setHeaderInset] = useState(0)
  // As listas de dentro: o collapse imperativo (re-tap na aba) precisa
  // devolvê-las ao topo, senão o resumo mostra fileiras roladas e o header
  // preso escondido (o headerStyle segue o offset do mural).
  const muralList = useRef<FlatList>(null)
  const eventsList = useRef<FlatList>(null)

  useEffect(() => {
    muralSummary.value = muralHeight
  }, [muralHeight, muralSummary])
  useEffect(() => {
    muralIsLocked.value = muralLocked
  }, [muralLocked, muralIsLocked])

  // Só nos pontos de repouso extremos (0 e o último estágio): trocar estado
  // JS no meio do gesto re-renderiza as duas grades e o dedo sente o engasgo.
  // Entre um e outro o valor anterior fica — o pan já decide sozinho quem é
  // dono do toque.
  useAnimatedReaction(
    () => expand.value,
    value => {
      const max = stageMax(focus.value)
      const settledAtTop = value >= max - EPSILON
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
        })
        .onStart(e => {
          // Tocar no meio do encaixe: o spring pararia de brigar com o dedo
          // só no fim — cancela e o gesto assume de onde a seção está.
          cancelAnimation(expand)
          const offset =
            focus.value === 'mural' ? muralOffset.value : eventsOffset.value
          // No último estágio a lista é dona do gesto — exceto arrastar pra
          // baixo com ela no topo, que é o pedido de voltar um estágio.
          panOwns.value =
            expand.value < stageMax(focus.value) ||
            (e.translationY > 0 && offset <= 0)
          startExpand.value = expand.value
          startTranslation.value = e.translationY
        })
        .onUpdate(e => {
          if (!panOwns.value) return
          expand.value = nextExpand(
            startExpand.value,
            e.translationY - startTranslation.value,
            stageTravel(
              focus.value,
              headerHeight.value,
              muralSummary.value,
              stageHeight.value,
            ),
            stageMax(focus.value),
          )
        })
        .onEnd(e => {
          if (!panOwns.value) return
          expand.value = withSpring(
            snapTarget(
              expand.value,
              startExpand.value,
              e.velocityY,
              stageMax(focus.value),
            ),
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
    ],
  )

  const onMuralScroll = useAnimatedScrollHandler({
    onScroll: e => {
      const previous = muralOffset.value
      const offset = e.contentOffset.y
      muralOffset.value = offset
      // CHEGOU de volta ao topo rolando (vinha de baixo): a seção de eventos
      // volta sozinha, sem pedir um segundo gesto. Só na chegada — um arrasto
      // que começa no topo também emite y = 0 e não pode disparar isto.
      if (
        previous > 0 &&
        offset <= 0 &&
        focus.value === 'mural' &&
        expand.value >= 1 - EPSILON
      ) {
        expand.value = withSpring(0, SPRING)
      }
    },
  })
  const onEventsScroll = useAnimatedScrollHandler({
    onScroll: e => {
      eventsOffset.value = e.contentOffset.y
    },
  })

  // Quanto do header já saiu por cima: no mural é o scroll da grade
  // (collapsing header); em eventos é o segundo estágio do gesto.
  const headerCollapse = () => {
    'worklet'
    const h = headerHeight.value
    if (focus.value === 'events') {
      return h * Math.min(1, Math.max(0, expand.value - 1))
    }
    return Math.min(h, Math.max(0, muralOffset.value))
  }

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -headerCollapse() }],
  }))

  // O mural ocupa o palco inteiro, por baixo do header (a lista recua a
  // altura dele). O que o "recorta" no resumo é a seção de eventos por cima
  // (fundo opaco); quando ela desce, o resto da grade aparece por trás. Não
  // se move: header e eventos é que passam por cima. `height` só muda com o
  // layout, nunca por frame.
  const muralStyle = useAnimatedStyle(() => ({
    top: 0,
    height: stageHeight.value,
  }))

  // Foco no mural: desce e sai por baixo. Foco em eventos: sobe a altura do
  // mural (estágio 1) e depois a do header, junto com ele (estágio 2).
  const eventsStyle = useAnimatedStyle(() => {
    const top = headerHeight.value + muralSummary.value
    const translateY =
      focus.value === 'mural'
        ? (stageHeight.value - top) * expand.value
        : -(muralSummary.value * Math.min(1, expand.value) + headerCollapse())
    return { top, height: stageHeight.value, transform: [{ translateY }] }
  })

  const veilStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, expand.value),
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

  // "Ver todas/todos": o primeiro estágio, com a mesma animação do gesto.
  const expandTo = useCallback(
    (target: StageFocus) => {
      focus.value = target
      expand.value = withSpring(1, SPRING)
    },
    [focus, expand],
  )
  const collapse = useCallback(() => {
    muralList.current?.scrollToOffset({ offset: 0, animated: false })
    eventsList.current?.scrollToOffset({ offset: 0, animated: false })
    muralOffset.value = 0
    eventsOffset.value = 0
    expand.value = withSpring(0, SPRING)
  }, [expand, muralOffset, eventsOffset])

  return {
    pan,
    muralNative,
    eventsNative,
    muralList,
    eventsList,
    onMuralScroll,
    onEventsScroll,
    headerStyle,
    muralStyle,
    eventsStyle,
    veilStyle,
    expanded,
    headerInset,
    setHeaderHeight,
    setStageHeight,
    expandTo,
    collapse,
  }
}
