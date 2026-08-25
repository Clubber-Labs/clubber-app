import { useEffect, useRef, useState } from 'react'
import type { View } from 'react-native'
import { subscribeKeyboardTop } from '../lib/keyboardTop'

// Quanto o teclado cobre de um elemento ancorado embaixo (bottom sheet).
//
// Mede a posição REAL do elemento na janela: assim independe do que houver
// ABAIXO do conteúdo (tab bar de 96px, safe area), que calcular por
// keyboardHeight cru ignoraria. Espalhe `ref` na View raiz da folha e use o
// valor como padding inferior do conteúdo — a superfície continua indo até a
// borda da tela, passando por trás do teclado.
//
// Fase 'will': o recuo acompanha a subida do teclado em vez de aparecer depois
// dela, o que evitaria ver o fundo entre a folha e o teclado por um instante.
export function useKeyboardOverlap() {
  const ref = useRef<View>(null)
  const [overlap, setOverlap] = useState(0)

  useEffect(
    () =>
      subscribeKeyboardTop('will', top => {
        if (top === null) {
          setOverlap(0)
          return
        }
        ref.current?.measureInWindow((_x, y, _width, height) =>
          setOverlap(Math.max(0, y + height - top)),
        )
      }),
    [],
  )

  return { ref, overlap }
}
