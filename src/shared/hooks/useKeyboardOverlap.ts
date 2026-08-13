import { useEffect, useRef, useState } from 'react'
import { Keyboard, Platform, type View } from 'react-native'

// Quanto o teclado cobre de um elemento ancorado embaixo (bottom sheet), no
// iOS. No Android o windowSoftInputMode=adjustResize já encolhe a janela, então
// um elemento em bottom-0 sobe sozinho — aqui é no-op.
//
// Mede a posição REAL do elemento na janela: assim independe do que houver
// ABAIXO do conteúdo (tab bar de 96px, safe area), que calcular por
// keyboardHeight cru ignoraria. Espalhe `ref` na View raiz da folha e use o
// valor como padding inferior do conteúdo — a superfície continua indo até a
// borda da tela, passando por trás do teclado.
export function useKeyboardOverlap() {
  const ref = useRef<View>(null)
  const [overlap, setOverlap] = useState(0)

  useEffect(() => {
    if (Platform.OS !== 'ios') return

    const show = Keyboard.addListener('keyboardWillShow', e => {
      const keyboardTop = e.endCoordinates.screenY
      ref.current?.measureInWindow((_x, y, _width, height) =>
        setOverlap(Math.max(0, y + height - keyboardTop)),
      )
    })
    const hide = Keyboard.addListener('keyboardWillHide', () => setOverlap(0))

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return { ref, overlap }
}
