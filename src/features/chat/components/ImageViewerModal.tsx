import { useEffect } from 'react'
import { Dimensions } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { MediaViewerModal } from '@/shared/components/MediaViewerModal'
import { useSwipeToDismiss } from '@/shared/hooks/useSwipeToDismiss'

type Props = {
  url: string | null
  onClose: () => void
}

const { width, height } = Dimensions.get('window')

export function ImageViewerModal({ url, onClose }: Props) {
  // translateY/bgOpacity e o dismiss vertical vêm do hook compartilhado; o resto
  // (pinch/zoom + pan dentro do enquadramento) é específico da imagem.
  const {
    translateY: ty,
    reset: resetDismiss,
    applyDrag,
    release,
    bgStyle,
  } = useSwipeToDismiss()
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const tx = useSharedValue(0)
  const savedTx = useSharedValue(0)
  const savedTy = useSharedValue(0)

  // Reseta zoom e dismiss a cada imagem aberta.
  useEffect(() => {
    scale.value = 1
    savedScale.value = 1
    tx.value = 0
    savedTx.value = 0
    savedTy.value = 0
    resetDismiss()
  }, [url, scale, savedScale, tx, savedTx, savedTy, resetDismiss])

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.max(1, savedScale.value * e.scale)
    })
    .onEnd(() => {
      savedScale.value = scale.value
    })

  const pan = Gesture.Pan()
    .onUpdate(e => {
      if (scale.value > 1) {
        // Imagem ampliada: arrastar move dentro do enquadramento.
        tx.value = savedTx.value + e.translationX
        ty.value = savedTy.value + e.translationY
      } else {
        // Sem zoom: dismiss vertical. Trava o eixo X (gesto previsível) e só o
        // Y arrasta a imagem / esmaece o fundo (useSwipeToDismiss).
        tx.value = 0
        applyDrag(e.translationY)
      }
    })
    .onEnd(e => {
      if (scale.value > 1) {
        savedTx.value = tx.value
        savedTy.value = ty.value
        return
      }
      // Sem zoom o X fica travado em 0 — devolve junto e deixa o hook decidir
      // entre fechar e voltar ao centro.
      tx.value = withTiming(0)
      release(e.translationY, onClose)
    })

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1)
      savedScale.value = 1
      tx.value = withTiming(0)
      ty.value = withTiming(0)
      savedTx.value = 0
      savedTy.value = 0
    })

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }))

  if (!url) return null

  return (
    <MediaViewerModal
      gesture={composed}
      bgStyle={bgStyle}
      closeLabel="Fechar imagem"
      onClose={onClose}
    >
      <Animated.View className="flex-1 items-center justify-center">
        <Animated.Image
          source={{ uri: url }}
          style={[{ width, height: height * 0.82 }, animatedStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </MediaViewerModal>
  )
}
