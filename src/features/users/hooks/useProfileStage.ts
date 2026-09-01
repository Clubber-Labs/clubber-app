import { useCallback, useEffect, useMemo, useState } from 'react'
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
  travelDistance,
  type StageFocus,
} from '../utils/profileStage'

// Sem overshoot: a seção encaixa no topo; passar dele abriria uma fresta.
const SPRING = { damping: 26, stiffness: 240, overshootClamping: true }
const SETTLED = 0.999

type Params = {
  // Sem o que expandir (vazio ou até 2 fileiras): o toque no mural vira eventos.
  muralLocked: boolean
  // Altura do mural em modo resumo — calculada (utils/profileStage), não medida.
  muralHeight: number
}

/**
 * Palco do perfil: header + mural + eventos no mesmo lugar, e um gesto que é
 * contextual à seção tocada. `expand` (0..1) é o único estado animado: 0 é o
 * resumo, 1 é o foco no lugar. Foco em eventos: a seção sobe até o topo,
 * cobrindo mural e header. Foco no mural: só a seção de eventos desce e sai —
 * header e mural ficam, e a grade rola normal se houver mais fotos; ao voltar
 * ao topo, eventos retorna sozinha. O dedo dirige o valor (1:1 com a seção
 * que se move) e o soltar faz o snap.
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
  // Seção expandida e parada — é ela que ganha scroll próprio.
  const [expanded, setExpanded] = useState<StageFocus | null>(null)
  const [headerMeasured, setHeaderMeasured] = useState(false)

  useEffect(() => {
    muralSummary.value = muralHeight
  }, [muralHeight, muralSummary])
  useEffect(() => {
    muralIsLocked.value = muralLocked
  }, [muralLocked, muralIsLocked])

  // Só nos pontos de repouso (0 e 1): trocar estado JS no meio do gesto
  // re-renderiza as duas grades e o dedo sente o engasgo. Entre um e outro o
  // valor anterior fica — o pan já decide sozinho quem é dono do toque.
  useAnimatedReaction(
    () => expand.value,
    value => {
      const settledAtTop = value >= SETTLED
      const settledAtRest = value <= 1 - SETTLED
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
            stageHeight.value,
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
        expand.value >= SETTLED
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

  // Avatar e stats só saem por cima quando eventos toma o palco; no mural o
  // header fica.
  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          focus.value === 'events' ? -headerHeight.value * expand.value : 0,
      },
    ],
  }))

  // O mural ocupa do pé do header ao pé do palco. O que o "recorta" no resumo
  // é a seção de eventos por cima dele (fundo opaco); quando ela desce, o
  // resto da grade aparece por trás. Quando é eventos que sobe, o mural
  // acompanha o header pra cima — senão as fotos ficam paradas atrás
  // enquanto o perfil sai. `top`/`height` só mudam com o layout, nunca por
  // frame — layout por frame é o que engasga.
  const muralStyle = useAnimatedStyle(() => ({
    top: headerHeight.value,
    height: Math.max(0, stageHeight.value - headerHeight.value),
    transform: [
      {
        translateY:
          focus.value === 'events' ? -headerHeight.value * expand.value : 0,
      },
    ],
  }))

  // Foco no mural: desce e sai por baixo. Foco em eventos: sobe até o topo,
  // cobrindo o mural.
  const eventsStyle = useAnimatedStyle(() => {
    const top = headerHeight.value + muralSummary.value
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
