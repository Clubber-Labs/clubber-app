import { Dimensions } from 'react-native'
import { KeyboardEvents } from 'react-native-keyboard-controller'

// Fonte ÚNICA de "onde está o topo do teclado", em coordenadas de janela (a
// mesma régua de measureInWindow). Só este arquivo fala com a lib de teclado.
//
// Por que não o `Keyboard` do core: no Android o `endCoordinates.screenY` vem de
// mVisibleViewArea.bottom — o fundo da janela — e, com o app em edge-to-edge
// (android/gradle.properties: edgeToEdgeEnabled), a janela deixou de encolher
// pro teclado, então esse valor não é mais o topo dele. O core também nunca
// emite keyboardWill* no Android. A lib lê o inset do IME e emite os quatro
// eventos nas duas plataformas.
//
// A base é `screen` e não `window` porque o app é edge-to-edge: as duas
// coincidem, e é isso que faz a conta bater com o measureInWindow de quem chama.
// Se o edge-to-edge cair, esta linha ganha um offset silencioso.
//
// `phase` decide o compromisso: 'will' antecipa o movimento (superfície que
// recua junto com o teclado, sem piscar o fundo); 'did' espera a geometria
// assentar, que é o que quem mede antes de rolar precisa.
export function subscribeKeyboardTop(
  phase: 'will' | 'did',
  onChange: (top: number | null) => void,
): () => void {
  const show = KeyboardEvents.addListener(
    phase === 'will' ? 'keyboardWillShow' : 'keyboardDidShow',
    event => onChange(Dimensions.get('screen').height - event.height),
  )
  const hide = KeyboardEvents.addListener(
    phase === 'will' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => onChange(null),
  )

  return () => {
    show.remove()
    hide.remove()
  }
}
