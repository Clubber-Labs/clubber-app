import { useCallback, useEffect, useMemo, useState } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import {
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
  travelDistance,
  STAGE_SECTION_GAP,
  type StageFocus,
} from '../utils/profileStage'

// Sem overshoot: a seção encaixa no topo; passar dele abriria uma fresta.
const SPRING = { damping: 26, stiffness: 240, overshootClamping: true }
const SETTLED = 0.999

type Params = {
  muralEmpty: boolean
  // Altura do mural em modo resumo — calculada (utils/profileStage), não medida.
  muralHeight: number
}

/**
 * Palco do perfil: header + mural + eventos no mesmo lugar, e um gesto que é
 * contextual à seção tocada. `expand` (0..1) é o único estado animado: 0 é o
 * resumo, 1 é a seção focada ocupando o palco. O dedo dirige o valor (a seção
 * anda 1:1 com ele) e o soltar faz o snap. Com a seção expandida a lista de
 * dentro rola normalmente; arrastar pra baixo com ela no topo devolve o gesto
 * ao palco — o mesmo mecanismo de um bottom sheet com conteúdo rolável.
 */
export function useProfileStage({ muralEmpty, muralHeight }: Params) {
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
  const muralIsEmpty = useSharedValue(muralEmpty)
  const reported = useSharedValue<StageFocus | null>(null)
  // Seção expandida e parada — é ela que ganha scroll próprio.
  const [expanded, setExpanded] = useState<StageFocus | null>(null)
  const [headerMeasured, setHeaderMeasured] = useState(false)

  useEffect(() => {
    muralSummary.value = muralHeight
  }, [muralHeight, muralSummary])
  useEffect(() => {
    muralIsEmpty.value = muralEmpty
  }, [muralEmpty, muralIsEmpty])

  useAnimatedReaction(
    () => expand.value,
    value => {
      const next: StageFocus | null = value >= SETTLED ? focus.value : null
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
              muralIsEmpty.value,
            )
          }
        })
        .onStart(e => {
          const offset =
            focus.value === 'mural' ? muralOffset.value : eventsOffset.value
          // Expandida, a lista é dona do gesto — exceto arrastar pra baixo com
          // ela no topo, que é o pedido de voltar ao resumo.
          panOwns.value =
            expand.value < 1 || (e.translationY > 0 && offset <= 0)
          startExpand.value = expand.value
          startTranslation.value = e.translationY
        })
        .onUpdate(e => {
          if (!panOwns.value) return
          const distance = travelDistance(
            focus.value,
            headerHeight.value,
            muralSummary.value,
          )
          expand.value = nextExpand(
            startExpand.value,
            e.translationY - startTranslation.value,
            distance,
          )
        })
        .onEnd(e => {
          if (!panOwns.value) return
          expand.value = withSpring(
            snapTarget(expand.value, e.velocityY),
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
      muralIsEmpty,
      muralOffset,
      eventsOffset,
      panOwns,
      startExpand,
      startTranslation,
    ],
  )

  const onMuralScroll = useAnimatedScrollHandler({
    onScroll: e => {
      muralOffset.value = e.contentOffset.y
    },
  })
  const onEventsScroll = useAnimatedScrollHandler({
    onScroll: e => {
      eventsOffset.value = e.contentOffset.y
    },
  })

  // Avatar e stats saem por cima nos dois casos.
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -headerHeight.value * expand.value }],
  }))

  // Segue o header pra cima e cresce até o palco inteiro quando é o foco.
  const muralStyle = useAnimatedStyle(() => {
    const summary = muralSummary.value
    const height =
      focus.value === 'mural'
        ? summary + (stageHeight.value - summary) * expand.value
        : summary
    return {
      top: headerHeight.value,
      height,
      transform: [{ translateY: -headerHeight.value * expand.value }],
    }
  })

  // Foco no mural: desce e sai por baixo. Foco em eventos: sobe até o topo,
  // cobrindo o mural.
  const eventsStyle = useAnimatedStyle(() => {
    const top = headerHeight.value + muralSummary.value + STAGE_SECTION_GAP
    const travel = focus.value === 'mural' ? stageHeight.value - top : -top
    return {
      top,
      height: stageHeight.value,
      transform: [{ translateY: travel * expand.value }],
    }
  })

  const veilStyle = useAnimatedStyle(() => ({
    opacity: 1 - expand.value,
  }))

  const setHeaderHeight = useCallback(
    (height: number) => {
      headerHeight.value = height
      setHeaderMeasured(height > 0)
    },
    [headerHeight],
  )
  const setStageHeight = useCallback(
    (height: number) => {
      stageHeight.value = height
    },
    [stageHeight],
  )

  const expandTo = useCallback(
    (target: StageFocus) => {
      focus.value = target
      expand.value = withSpring(1, SPRING)
    },
    [focus, expand],
  )
  const collapse = useCallback(() => {
    expand.value = withSpring(0, SPRING)
  }, [expand])

  return {
    pan,
    muralNative,
    eventsNative,
    onMuralScroll,
    onEventsScroll,
    headerStyle,
    muralStyle,
    eventsStyle,
    veilStyle,
    expanded,
    headerMeasured,
    setHeaderHeight,
    setStageHeight,
    expandTo,
    collapse,
  }
}
