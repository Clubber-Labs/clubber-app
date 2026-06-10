import { useCallback } from 'react'
import { Dimensions } from 'react-native'
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'

const { height } = Dimensions.get('window')
// Distância vertical pra confirmar o "arrastar pra fechar".
const CLOSE_THRESHOLD = 120
// Distância de arraste em que o fundo chega à opacidade 0.
const FADE_DISTANCE = height * 0.6

// Dismiss vertical de visualizador de mídia em tela cheia: arrastar move o
// conteúdo no eixo Y e esmaece um fundo preto; passando do limiar, fecha; senão,
// volta ao centro. O consumidor monta o próprio Gesture.Pan e chama applyDrag no
// onUpdate e release no onEnd — assim cada tela combina o dismiss com o que
// precisa (zoom da imagem, controles nativos do vídeo) sem duplicar a lógica.
export function useSwipeToDismiss() {
  const translateY = useSharedValue(0)
  // Opacidade do fundo preto — some conforme arrasta pra fechar.
  const bgOpacity = useSharedValue(1)

  const reset = useCallback(() => {
    translateY.value = 0
    bgOpacity.value = 1
  }, [translateY, bgOpacity])

  const applyDrag = useCallback(
    (translationY: number) => {
      'worklet'
      translateY.value = translationY
      bgOpacity.value = Math.max(0, 1 - Math.abs(translationY) / FADE_DISTANCE)
    },
    [translateY, bgOpacity],
  )

  const release = useCallback(
    (translationY: number, onClose: () => void) => {
      'worklet'
      if (Math.abs(translationY) > CLOSE_THRESHOLD) {
        // Passou do limiar → fecha (o Modal faz o fade de saída).
        runOnJS(onClose)()
      } else {
        // Não passou → volta ao centro e restaura o fundo.
        translateY.value = withTiming(0)
        bgOpacity.value = withTiming(1)
      }
    },
    [translateY, bgOpacity],
  )

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }))

  return { translateY, reset, applyDrag, release, bgStyle }
}
