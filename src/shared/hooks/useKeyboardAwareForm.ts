import { useCallback, useMemo, useRef } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type View,
} from 'react-native'
import { subscribeKeyboardTop } from '../lib/keyboardTop'

type Measurable = {
  measureInWindow(
    callback: (x: number, y: number, width: number, height: number) => void,
  ): void
}

type Span = { top: number; bottom: number }

/** Folga entre o campo em foco e o que houver abaixo dele (teclado, barra). */
const KEYBOARD_GAP = 64
/** Respiro no topo, só pra letra do rótulo não encostar na borda. */
const EDGE_GAP = 16

// Quanto rolar (positivo = descer) pra `field` caber em `band`. Campo mais alto
// que a faixa prioriza o topo — é onde estão o rótulo e o começo da digitação.
export function scrollDelta(field: Span, band: Span): number {
  if (field.bottom > band.bottom)
    return Math.min(
      field.bottom - band.bottom,
      Math.max(0, field.top - band.top),
    )
  if (field.top < band.top) return field.top - band.top
  return 0
}

function measure(target: Measurable): Promise<Span> {
  return new Promise(resolve =>
    target.measureInWindow((_x, y, _width, height) =>
      resolve({ top: y, bottom: y + height }),
    ),
  )
}

export type KeyboardAwareForm = {
  /** Espalhe na ScrollView do formulário. */
  scrollProps: {
    ref: React.RefObject<ScrollView | null>
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
    scrollEventThrottle: number
    keyboardShouldPersistTaps: 'handled'
  }
  /** Espalhe no TextInput: vira alvo de foco e sobe sozinho ao ganhar foco. */
  input: (name: string) => {
    ref: (node: TextInput | null) => void
    onFocus: () => void
  }
  /** Espalhe na View que envolve o campo (rótulo + controle + erro). */
  anchor: (name: string) => { ref: (node: View | null) => void }
  scrollToField: (name: string) => void
  /**
   * Rola e foca o campo mais alto entre os informados, e DEVOLVE qual foi —
   * quem mostra a mensagem precisa falar do mesmo campo que ganhou o foco.
   */
  focusFirstOf: (names: string[]) => Promise<string | null>
  /** Passe como onInvalid do handleSubmit: rola e foca o primeiro erro. */
  focusFirstError: (errors: Record<string, unknown>) => Promise<string | null>
}

/**
 * Mantém o campo em foco visível, com folga fixa acima do teclado (e de
 * qualquer barra abaixo da ScrollView), e leva o usuário até o primeiro campo
 * com erro no submit.
 *
 * A faixa visível sai da medição real da ScrollView na janela cruzada com o
 * topo do teclado: funciona com a viewport encolhendo ou não, sem contar duas
 * vezes.
 *
 * O scroll acontece uma única vez, sempre com a geometria já assentada: com o
 * teclado abrindo, só depois do keyboardDidShow; com ele já aberto, no próprio
 * onFocus. Reagir também ao keyboardWillShow daria dois movimentos, e o
 * primeiro seria curto — a viewport ainda não tinha encolhido.
 */
export function useKeyboardAwareForm(
  gap: number = KEYBOARD_GAP,
): KeyboardAwareForm {
  const scrollRef = useRef<ScrollView>(null)
  const offset = useRef(0)
  // Topo do teclado em coordenadas de janela; null enquanto ele está fechado.
  const keyboardTop = useRef<number | null>(null)
  const inputs = useRef(new Map<string, TextInput>())
  const anchors = useRef(new Map<string, View>())

  const reveal = useCallback(
    async (target: Measurable | null | undefined) => {
      const host = scrollRef.current?.getNativeScrollRef()
      if (!target || !host) return
      const [viewport, field] = await Promise.all([
        measure(host),
        measure(target),
      ])
      // A folga cheia vale contra o teclado. Contra a borda da ScrollView (que
      // já exclui barras fixas abaixo dela) basta o respiro — somar as duas
      // jogaria o campo pra cima sem necessidade.
      const delta = scrollDelta(field, {
        top: viewport.top + EDGE_GAP,
        bottom: Math.min(
          viewport.bottom - EDGE_GAP,
          (keyboardTop.current ?? Infinity) - gap,
        ),
      })
      if (Math.abs(delta) < 1) return
      scrollRef.current?.scrollTo({
        y: Math.max(0, offset.current + delta),
        animated: true,
      })
    },
    [gap],
  )

  const targetOf = useCallback(
    (name: string) => anchors.current.get(name) ?? inputs.current.get(name),
    [],
  )

  // Rola o grupo do campo (rótulo + controle + erro), não só a caixa de texto:
  // subir apenas o input deixaria o rótulo raspando a borda de cima.
  const revealFocused = useCallback(() => {
    const focused = TextInput.State.currentlyFocusedInput()
    const registered = [...inputs.current.entries()].find(
      ([, node]) => node === focused,
    )
    void reveal(registered ? targetOf(registered[0]) : focused)
  }, [reveal, targetOf])

  // useFocusEffect (e não useEffect): telas empilhadas continuam montadas, e sem
  // isso a tela de baixo também reagiria ao teclado da tela de cima.
  useFocusEffect(
    useCallback(
      () =>
        subscribeKeyboardTop('did', top => {
          keyboardTop.current = top
          // Um frame pra absorver o encolhimento do KeyboardAvoidingView antes
          // de medir — assim o único scroll já sai na posição final.
          if (top !== null) requestAnimationFrame(revealFocused)
        }),
      [revealFocused],
    ),
  )

  const scrollProps = useMemo(
    () => ({
      ref: scrollRef,
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        offset.current = event.nativeEvent.contentOffset.y
      },
      scrollEventThrottle: 16,
      keyboardShouldPersistTaps: 'handled' as const,
    }),
    [],
  )

  // Props memoizadas por nome: um objeto novo a cada render remontaria o ref
  // (null seguido do nó) e esvaziaria o registro no meio da digitação.
  const inputProps = useRef(
    new Map<string, ReturnType<KeyboardAwareForm['input']>>(),
  )
  const anchorProps = useRef(
    new Map<string, ReturnType<KeyboardAwareForm['anchor']>>(),
  )

  const input = useCallback(
    (name: string) => {
      const cached = inputProps.current.get(name)
      if (cached) return cached
      const props = {
        ref: (node: TextInput | null) => {
          if (node) inputs.current.set(name, node)
          else inputs.current.delete(name)
        },
        // Com o teclado já aberto não vem evento novo, e a geometria não muda:
        // este é o momento certo de rolar. Abrindo, quem rola é o didShow.
        onFocus: () => {
          if (keyboardTop.current !== null) revealFocused()
        },
      }
      inputProps.current.set(name, props)
      return props
    },
    [revealFocused],
  )

  const anchor = useCallback((name: string) => {
    const cached = anchorProps.current.get(name)
    if (cached) return cached
    const props = {
      ref: (node: View | null) => {
        if (node) anchors.current.set(name, node)
        else anchors.current.delete(name)
      },
    }
    anchorProps.current.set(name, props)
    return props
  }, [])

  const scrollToField = useCallback(
    (name: string) => void reveal(targetOf(name)),
    [reveal, targetOf],
  )

  const focusFirstOf = useCallback(
    async (names: string[]): Promise<string | null> => {
      const candidates = names.filter(name => !!targetOf(name))
      if (!candidates.length) return null
      // Ordem de montagem não é ordem visual (campos condicionais entram
      // depois), então o "primeiro" é o mais alto na tela.
      const measured = await Promise.all(
        candidates.map(async name => ({
          name,
          top: (await measure(targetOf(name)!)).top,
        })),
      )
      const first = measured.reduce((a, b) => (b.top < a.top ? b : a))
      const field = inputs.current.get(first.name)
      field?.focus()
      // Se o foco vai abrir o teclado, o scroll é do didShow — rolar aqui seria
      // um movimento a mais, e ainda por cima medindo a tela sem teclado.
      if (!field || keyboardTop.current !== null)
        await reveal(targetOf(first.name))
      return first.name
    },
    [reveal, targetOf],
  )

  const focusFirstError = useCallback(
    (errors: Record<string, unknown>) => focusFirstOf(Object.keys(errors)),
    [focusFirstOf],
  )

  return {
    scrollProps,
    input,
    anchor,
    scrollToField,
    focusFirstOf,
    focusFirstError,
  }
}
